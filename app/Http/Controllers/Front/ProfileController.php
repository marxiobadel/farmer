<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\OrderRequest;
use App\Http\Resources\AddressResource;
use App\Http\Resources\CartResource;
use App\Http\Resources\CountryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ZoneResource;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Country;
use App\Models\Order;
use App\Models\StockMovement;
use App\Models\User;
use App\Settings\GeneralSettings;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $recentOrders = $user->orders()
            ->with(['items.product', 'carrier'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('front/profile/index', [
            'recentOrders' => OrderResource::collection($recentOrders),
            'stats' => [
                'orders_count' => $user->orders()->count(),
                'total_spent' => $user->orders()->where('status', '=', 'completed')->sum('total'),
            ],
        ]);
    }

    public function orders(Request $request)
    {
        $orders = Auth::user()->orders()
            ->with(['items.product', 'carrier', 'payments'])
            ->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('front/profile/orders', [
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function showOrder(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403, 'Vous n\'êtes pas autorisé à voir cette commande.');

        return Inertia::render('front/profile/order-show', [
            'order' => new OrderResource($order->load(['user', 'carrier', 'items.product', 'items.variant'])),
        ]);
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

        return response()->json([
            'filename' => 'facture-' . $order->id . '.pdf',
            'file' => base64_encode($pdf->output())
        ]);
    }

    public function edit(Request $request)
    {
        return Inertia::render('front/profile/edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'lastname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($request->user()->id),
            ],
            'phone' => 'nullable|string|max:255',
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $request->user()->fill($validated);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        if ($request->hasFile('image')) {
            $request->user()->addMediaFromRequest('image')->toMediaCollection('profile');
        }

        return back()->with('status', 'profile-updated');
    }

    public function addresses(Request $request)
    {
        $countries = Cache::rememberForever('countries', function () {
            return Country::orderBy('name')->get(['id', 'iso', 'nicename', 'name', 'phonecode']);
        });

        return Inertia::render('front/profile/addresses', [
            'addresses' => AddressResource::collection($request->user()->addresses),
            'countries' => fn() => CountryResource::collection($countries),
        ]);
    }

    public function security(Request $request)
    {
        return Inertia::render('front/profile/password', [
            'status' => session('status'),
        ]);
    }

    public function espacePro()
    {
        $currentUser = Auth::user();

        [$products, $users, $zones] = $this->loadOrderFormData();

        $cart = Cart::firstOrCreate(['user_id' => $currentUser->id]);
        $cart->load('items.product', 'items.variant');

        return Inertia::render('front/profile/pro', [
            'hasProSpace' => $currentUser->proRequests()->count() > 0,
            'products' => ProductResource::collection($products),
            'zones' => ZoneResource::collection($zones),
            'addresses' => AddressResource::collection($currentUser->addresses),
            'cart' => new CartResource($cart),
        ]);
    }

    public function addToCart(Request $request)
    {
        $currentUser = Auth::user();
        $cart = Cart::firstOrCreate(['user_id' => $currentUser->id]);

        $request->validate([
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

        return redirect()->back();
    }

    public function updateCartItem(Request $request, CartItem $cartItem)
    {
        $cartItem->update(['quantity' => $request->quantity]);

        return redirect()->back();
    }

    public function removeCartItem(CartItem $cartItem)
    {
        $cartItem->delete();

        return redirect()->back();
    }

    public function storeOrder(OrderRequest $request)
    {
        $data = $request->validated();

        $currentUser = Auth::user();
        $cart = Cart::with(['items.product', 'items.variant'])->firstOrCreate(['user_id' => $currentUser->id]);

        if ($cart->items->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le panier est vide.',
            ]);
        }

        $shippingAddress = Address::findOrFail($data['shipping_address_id']);

        $billingAddress = !empty($data['billing_address_id'])
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
                'user_id' => $currentUser->id,
                'carrier_id' => $data['carrier_id'],
                'status' => 'pending',
                'total' => $grandTotal,
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
                    'user_id' => null, // Ou null si c'est le client
                    'quantity' => -($item->quantity), // NÉGATIF pour une sortie
                    'type' => 'sale',
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'note' => "Commande client #{$order->id}",
                ]);
            }

            // C. Create Payment Record
            $response = $this->payment($order, $data);

            // D. Clear Cart
            // Detach items or delete the cart depending on your logic.
            // Here we delete the items so the cart ID remains valid but empty (common for session carts).
            $cart->items()->delete();

            DB::commit();

            return response()->json($response);
        } catch (Exception $e) {
            DB::rollBack();
            // Log the error for debugging
            report($e);

            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création de la commande : ' . $e->getMessage(),
            ]);
        }
    }
}
