<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\AddressResource;
use App\Http\Resources\CountryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ZoneResource;
use App\Mail\OrderCreated;
use App\Models\Country;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Zone;
use App\Services\CartService;
use App\Services\MobileMoney;
use App\Services\OrangeMoney;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function __construct(
        protected CartService $cartService,
        MobileMoney $mobileMoney,
        OrangeMoney $orangeMoney)
    {
        parent::__construct($mobileMoney, $orangeMoney);
    }

    public function create()
    {
        $currentUser = Auth::user();

        $addresses = $currentUser ? $currentUser->addresses()->get() : [];
        $zones = Zone::with(['rates.carrier' => fn ($q) => $q->where('is_active', '=', true)])->get();
        $products = Product::with('variants.options')->latest()->get();

        $countries = Cache::rememberForever('countries', function () {
            return Country::orderBy('name')->get(['id', 'iso', 'nicename', 'name', 'phonecode']);
        });

        return inertia('front/orders/create', [
            'user_addresses' => AddressResource::collection($addresses),
            'zones' => ZoneResource::collection($zones),
            'countries' => CountryResource::collection($countries),
            'products' => ProductResource::collection($products),
        ]);
    }

    public function store(CheckoutRequest $request)
    {
        $data = $request->validated();
        $user = Auth::user();

        $cart = $this->cartService->getCart();

        if ($cart->items->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le panier est vide.',
            ]);
        }

        // --- Début Logique Coupon ---
        $cartSubtotal = $cart->items->sum(fn ($item) => $item->price * $item->quantity);
        $discountAmount = 0;
        $coupon = $cart->coupon;

        if ($coupon) {
            // Vérification de sécurité de dernière minute
            if (!$coupon->isValid()) { // Méthode définie dans le modèle Coupon
                return response()->json([
                    'status' => 'error',
                    'message' => 'Le code promo appliqué n\'est plus valide ou a expiré.',
                ]);
            }

            if ($coupon->min_order_amount && $cartSubtotal < $coupon->min_order_amount) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Le montant minimum pour ce code promo ({$coupon->min_order_amount}) n'est plus atteint.",
                ]);
            }

            // Calcul du montant de la réduction
            if ($coupon->type === 'fixed') {
                $discountAmount = $coupon->value;
            } elseif ($coupon->type === 'percent') {
                $discountAmount = $cartSubtotal * ($coupon->value / 100);
            }

            // La réduction ne peut pas excéder le sous-total
            $discountAmount = min($discountAmount, $cartSubtotal);
        }
        // --- Fin Logique Coupon ---

        $contactInfo = [
            'firstname' => $data['firstname'],
            'lastname' => $data['lastname'],
            'phone' => $data['phone'],
        ];

        $shippingSnapshot = array_merge($data['shipping_address'], $contactInfo);

        if (! $data['use_billing_address']) {
            $billingSnapshot = [...$shippingSnapshot];
        } else {
            $billingArray = [
                'alias' => $data['shipping_address']['alias'],
                'state' => $data['shipping_address']['state'],
                'address' => $data['billing_address']['address'],
                'city' => $data['billing_address']['city'],
                'postal_code' => $data['shipping_address']['postal_code'],
                'country_id' => $data['shipping_address']['country_id'],
            ];

            $billingSnapshot = array_merge($billingArray, $contactInfo);
        }

        if ($user && ($data['save_address'] ?? false)) {
            $user->addresses()->create($shippingSnapshot);
        }

        $cartMetrics = $cart->items->reduce(function ($carry, $item) {
            $product = $item->product;

            // Calculs basés sur les dimensions (cm) et poids (kg)
            $volume = (($product->length ?? 0) * ($product->width ?? 0) * ($product->height ?? 0)) * $item->quantity;
            $weight = ($product->weight ?? 0) * $item->quantity;
            $price = $item->price * $item->quantity;

            return [
                'weight' => $carry['weight'] + $weight,
                'price' => $carry['price'] + $price,
                'volume' => $carry['volume'] + $volume,
            ];
        }, ['weight' => 0, 'price' => 0, 'volume' => 0]);

        $totalQty = $this->calculateTotalQty($cart->items);

        $shippingCost = $this->calculateShippingCost(
            $data['carrier_id'],
            $this->getZoneIdFromRequest($request),
            $cartMetrics,
            $totalQty
        );

        // --- Calcul du Grand Total avec Réduction ---
        // (Sous-total - Réduction) + Frais de port
        $grandTotal = max(0, ($cartSubtotal - $discountAmount) + $shippingCost);

        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'carrier_id' => $data['carrier_id'],
                'status' => 'pending',
                'total' => $grandTotal,
                'discount' => $discountAmount,
                'coupon_code' => $coupon?->code,
                'shipping_address' => $shippingSnapshot,
                'invoice_address' => $billingSnapshot,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]);

                // Gestion du Stock (Décrémentation)
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'user_id' => $user ? $user->id : null,
                    'quantity' => -($item->quantity), // Sortie de stock
                    'type' => 'sale',
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'note' => "Commande client #{$order->id}",
                ]);
            }

            // --- Incrémentation du compteur d'utilisation du coupon ---
            if ($coupon) {
                $coupon->increment('usage_count');
            }

            // C. Create Payment Record
            $response = $this->payment($order, $data);

            $this->cartService->clear();

            DB::commit();

            // Ici, vous pourriez déclencher un Event pour envoyer l'email de confirmation
            // Event::dispatch(new OrderCreated($order));
            rescue(
                fn () => Mail::to($user->email)->sendNow(new OrderCreated($order)),
                null,
                false
            );

            return response()->json($response);
        } catch (Exception $e) {
            DB::rollBack();
            report($e);

            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création de la commande : '.$e->getMessage(),
            ]);
        }
    }

    public function success(Order $order)
    {
        // Sécurité : Vérifier que la commande appartient bien à l'utilisateur ou à la session
        if (Auth::check()) {
            if ($order->user_id !== Auth::id()) {
                abort(403);
            }
        }
        // Si invité, on pourrait vérifier un token de session stocké lors du store,
        // mais pour l'instant on laisse accessible si on a l'ID (ou on sécurisera plus tard).

        return inertia('front/orders/success', [
            'order' => new OrderResource($order->load(['user', 'carrier', 'items.product', 'items.variant'])),
        ]);
    }
}
