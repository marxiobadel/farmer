<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Http\Resources\CartResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\ZoneResource;
use App\Mail\OrderCancelled;
use App\Mail\OrderDelivered;
use App\Mail\OrderOutForDelivery;
use App\Mail\OrderShipped;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\StockMovement;
use App\Settings\GeneralSettings;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1'],
            'search' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Order::with(['user', 'items.product', 'items.variant']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $searchColumns = ['firstname', 'lastname', 'email'];
                $q->where('id', '=', $search)
                    ->orWhereHas('user', fn ($u) => $u->whereAny($searchColumns, 'like', "%$search%"))
                    ->orWhere('status', 'like', "%$search%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', '=', $request->string('status'));
        }

        $allowed = ['total', 'created_at', 'updated_at', 'status'];
        if ($request->filled('sort')) {
            $sort = $request->string('sort');
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            if (in_array($column, $allowed)) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->integer('per_page', 10);
        $orders = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => OrderResource::collection($orders)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function create(Request $request)
    {
        [$products, $users, $zones] = $this->loadOrderFormData();

        $cart = Cart::firstOrCreate(['id' => $request->cart_id]);
        $cart->load('items.product', 'items.variant');

        return Inertia::render('admin/orders/create', [
            'products' => ProductResource::collection($products),
            'users' => UserResource::collection($users),
            'zones' => ZoneResource::collection($zones),
            'cart' => new CartResource($cart),
        ]);
    }

    public function edit(Order $order)
    {
        [$products, $users, $zones] = $this->loadOrderFormData();

        return Inertia::render('admin/orders/edit', [
            'order' => new OrderResource(
                $order->load(['user', 'carrier', 'items.product', 'items.variant'])
            ),
            'products' => ProductResource::collection($products),
            'users' => UserResource::collection($users),
            'zones' => ZoneResource::collection($zones),
        ]);
    }

    public function show(Order $order)
    {
        return Inertia::render('admin/orders/show', [
            'order' => new OrderResource($order->load(['user', 'carrier', 'items.product', 'items.variant'])),
        ]);
    }

    public function store(OrderRequest $request)
    {
        $data = $request->validated();

        $cart = Cart::with(['items.product', 'items.variant'])->findOrFail($data['cart_id']);

        if ($cart->items->isEmpty()) {
            return redirect()
                ->route('admin.orders.create', $request->safe()->only(['cart_id']))
                ->with('error', 'Le panier est vide.');
        }

        $shippingAddress = Address::findOrFail($data['shipping_address_id']);

        $billingAddress = ! empty($data['billing_address_id'])
            ? Address::findOrFail($data['billing_address_id'])
            : $shippingAddress;

        $cartMetrics = $this->calculateMetrics($cart->items);

        $totalQty = $this->calculateTotalQty($cart->items);

        $shippingCost = $this->calculateShippingCost(
            $data['carrier_id'],
            $data['zone_id'],
            $cartMetrics,
            $totalQty
        );

        $grandTotal = $cartMetrics['price'] + $shippingCost;

        DB::beginTransaction();

        try {
            // A. Create Order
            $order = Order::create([
                'user_id' => $data['user_id'],
                'carrier_id' => $data['carrier_id'],
                'status' => $data['status'] ?? 'pending',
                'total' => $grandTotal,
                // SNAPSHOT: Convert models to array to save JSON.
                // This ensures if the user changes their address later, the order history remains correct.
                'shipping_address' => $shippingAddress->toArray(),
                'invoice_address' => $billingAddress->toArray(),
            ]);

            // B. Create Order Items (Transfer from Cart)
            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price, // Price at the moment of purchase
                ]);

                StockMovement::create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'user_id' => auth()->id(), // Ou null si c'est le client
                    'quantity' => -($item->quantity), // NÉGATIF pour une sortie
                    'type' => 'sale',
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'note' => "Commande #{$order->id}",
                ]);
            }

            // C. Create Payment Record
            // Status depends on method. 'Cash' is pending. 'Stripe' might be completed immediately if handled via webhook elsewhere.
            $paymentStatus = ($data['method'] === 'cash') ? 'pending' : 'pending';

            $order->payments()->create([
                'user_id' => $data['user_id'],
                'reference' => 'PAY-'.strtoupper(Str::random(12)),
                'transaction_id' => null, // Will be filled by payment gateway callback if online
                'method' => $data['method'],
                'provider' => $this->getProviderForMethod($data['method']), // helper to determine provider
                'amount' => $grandTotal,
                'currency' => Number::defaultCurrency(),
                'status' => $paymentStatus,
                'paid_at' => null,
                'details' => null,
            ]);

            // D. Clear Cart
            // Detach items or delete the cart depending on your logic.
            // Here we delete the items so the cart ID remains valid but empty (common for session carts).
            $cart->items()->delete();

            DB::commit();

            return redirect()->route('admin.orders.index') // Adjust route
                ->with('success', 'Commande créée avec succès !');
        } catch (\Exception $e) {
            DB::rollBack();
            // Log the error for debugging
            report($e);

            return redirect()
                ->route('admin.orders.create', $request->safe()->only(['cart_id']))
                ->with('error', 'Erreur lors de la création de la commande: '.$e->getMessage());
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $newStatus = $validated['status'];

        if ($order->status === $newStatus) {
            return back()->with('info', 'La commande a déjà ce statut.');
        }

        $order->update(['status' => $newStatus]);

        $emailCacheKey = "order_{$order->id}_status_{$newStatus}_sent";

        $shouldSendEmail = Cache::add($emailCacheKey, true, now()->addYear());

        if ($shouldSendEmail) {
            $this->sendEmailNotification($order, $newStatus);
        }

        return back()->with('success', 'Statut de la commande mis à jour.');
    }

    protected function sendEmailNotification(Order $order, string $status)
    {
        $user = $order->user;

        if (! $user) {
            return;
        }

        $mailable = match ($status) {
            'picked_up' => new OrderShipped($order),    // Exemple : Pris en charge
            'out_for_delivery' => new OrderOutForDelivery($order), // Exemple : En cours de livraison
            'delivered' => new OrderDelivered($order),  // Exemple : Livré
            'cancelled' => new OrderCancelled($order),  // Exemple : Annulé
            default => null,
        };

        if ($mailable) {
            Mail::to($user)->queue($mailable);
        }
    }

    public function downloadInvoice(GeneralSettings $settings, Order $order)
    {
        $order->load(['user', 'items.product', 'items.variant', 'carrier']);

        $data = [
            'order' => $order,
            'company' => [
                'name' => config('app.name'),
                'address' => $settings->address,
                'phone' => $settings->phone,
                'email' => $settings->email,
                'logo' => public_path('images/logo_with_bg.png'),
                'sign' => public_path('images/sign.png'),
                'cachet' => public_path('images/white-logo.jpg'),
            ],
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data);

        return $pdf->download('facture-'.$order->id.'.pdf');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Order::destroy($ids);
            }

            return redirect()->back()->with('success', 'Commande(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }

    public function addToCart(Request $request, Cart $cart)
    {
        $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'price' => 'required|numeric',
        ]);

        /**
         * @var ?CartItem $existingItem
         */
        $existingItem = $cart->items()
            ->where('product_id', '=', $request->product_id)
            ->where('variant_id', '=', $request->variant_id)
            ->first();

        if ($existingItem) {
            $existingItem->increment('quantity');
        } else {
            $cart->items()->create([
                'product_id' => $request->product_id,
                'variant_id' => $request->variant_id,
                'price' => $request->price,
                'quantity' => 1,
            ]);
        }

        return redirect()->route('admin.orders.create', ['cart_id' => $cart->id]);
    }

    public function updateCartItem(Request $request, Cart $cart, CartItem $cartItem)
    {
        $cartItem->update(['quantity' => $request->quantity]);

        return redirect()->route('admin.orders.create', ['cart_id' => $cart->id]);
    }

    public function removeCartItem(Cart $cart, CartItem $cartItem)
    {
        $cartItem->delete();

        return redirect()->route('admin.orders.create', ['cart_id' => $cart->id]);
    }
}
