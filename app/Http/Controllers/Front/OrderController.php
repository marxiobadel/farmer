<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\AddressResource;
use App\Http\Resources\CountryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ZoneResource;
use App\Mail\AdminOrderCreated;
use App\Mail\OrderCreated;
use App\Models\Country;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Zone;
use App\Services\CartService;
use App\Services\MobileMoney;
use App\Services\OrangeMoney;
use App\Settings\GeneralSettings;
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
        OrangeMoney $orangeMoney
    ) {
        parent::__construct($mobileMoney, $orangeMoney);
    }

    public function create()
    {
        $currentUser = Auth::user();

        $addresses = $currentUser ? $currentUser->addresses()->get() : [];
        $zones = Zone::with(['rates.carrier' => fn($q) => $q->where('is_active', '=', true)])->get();
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

    public function store(CheckoutRequest $request, GeneralSettings $settings)
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
        $cartSubtotal = $cart->items->sum(fn($item) => $item->price * $item->quantity);
        $discountAmount = 0;
        $coupon = $cart->coupon;

        if ($coupon) {
            if (!$coupon->isValid()) {
                return response()->json(['status' => 'error', 'message' => 'Le code promo n\'est plus valide.']);
            }
            if ($coupon->min_order_amount && $cartSubtotal < $coupon->min_order_amount) {
                return response()->json(['status' => 'error', 'message' => "Le montant minimum pour ce code ({$coupon->min_order_amount}) n'est plus atteint."]);
            }
            if ($coupon->type === 'fixed') {
                $discountAmount = $coupon->value;
            } elseif ($coupon->type === 'percent') {
                $discountAmount = $cartSubtotal * ($coupon->value / 100);
            }
            $discountAmount = min($discountAmount, $cartSubtotal);
        }

        // --- Préparation des adresses ---
        $contactInfo = [
            'firstname' => $data['firstname'],
            'lastname' => $data['lastname'],
            'phone' => $data['phone'],
        ];

        $shippingSnapshot = array_merge($data['shipping_address'], $contactInfo);

        if (!$data['use_billing_address']) {
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

        // --- Calcul logistique ---
        $cartMetrics = $cart->items->reduce(function ($carry, $item) {
            $product = $item->product;
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
        $shippingCost = $this->calculateShippingCost($data['carrier_id'], $this->getZoneIdFromRequest($request), $cartMetrics, $totalQty);

        // --- Calcul du Grand Total ---
        $grandTotal = max(0, ($cartSubtotal - $discountAmount) + $shippingCost);

        // =========================================================================
        // 1. PHASE DE PAIEMENT (EN DEHORS DE LA TRANSACTION BDD)
        // =========================================================================
        $method = data_get($data, 'payment_method');
        $paymentData = [];

        if (in_array($method, ['orange_money', 'mtn_money'])) {
            if ($grandTotal < 10) {
                return response()->json(['status' => 'error', 'message' => 'Au moins 10 FCFA pour effectuer un paiement mobile.']);
            }

            try {
                if ($method === 'orange_money') {
                    $result = $this->orangeMoney->webPayment([
                        'amount' => (string) $grandTotal,
                        'subscriberMsisdn' => $data['payment_phone'],
                    ]);

                    $payToken = $result['data']['payToken'] ?? null;
                    if (!$payToken)
                        throw new Exception('Paiement OM non initié.');

                    $paymentData['transaction_id'] = $payToken;
                    $paymentStatus = $this->waitForTransaction(function () use ($payToken) {
                        return $this->orangeMoney->checkTransactionStatus($payToken)['data']['status'] ?? 'pending';
                    }, 20);

                } elseif ($method === 'mtn_money') {
                    $result = $this->mobileMoney->webPayment([
                        'amount' => (string) $grandTotal,
                        'subscriberMsisdn' => $data['payment_phone'],
                    ]);

                    $messageId = $result['MessageId'] ?? $result['parameters']['MessageId'] ?? null;
                    if (!$messageId)
                        throw new Exception('Paiement MoMo non initié.');

                    $paymentData['transaction_id'] = $messageId;
                    $paymentStatus = $this->waitForTransaction(function () use ($messageId) {
                        return $this->mobileMoney->checkTransactionStatus($messageId)['status'] ?? 'pending';
                    }, 20);
                }

                // Si l'utilisateur n'a pas validé sur son téléphone, on arrête TOUT.
                if (!in_array($paymentStatus, ['successful', 'successfull'])) {
                    $messages = [
                        'cancelled' => 'Paiement annulé par l\'utilisateur.',
                        'failed' => 'Le paiement a échoué. Veuillez vérifier votre solde.',
                        'expired' => 'Le délai de validation a expiré.',
                    ];
                    return response()->json(['status' => 'error', 'message' => $messages[$paymentStatus] ?? 'Échec du paiement.']);
                }

            } catch (Exception $e) {
                return response()->json(['status' => 'error', 'message' => 'Erreur de paiement : ' . $e->getMessage()]);
            }
        }

        // =========================================================================
        // 2. PHASE DE SAUVEGARDE (LE PAIEMENT A REUSSI !)
        // =========================================================================
        DB::beginTransaction();

        try {
            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'carrier_id' => $data['carrier_id'],
                'status' => $method === 'cash' ? 'pending' : 'completed', // Validée d'office si Mobile Money
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

                // Gestion du Stock
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'user_id' => $user ? $user->id : null,
                    'quantity' => -($item->quantity),
                    'type' => 'sale',
                    'reference_type' => Order::class,
                    'reference_id' => $order->id,
                    'note' => "Commande client #{$order->id}",
                ]);
            }

            if ($coupon) {
                $coupon->increment('usage_count');
            }

            // Historiser le paiement en base de données
            $order->payments()->create([
                'user_id' => $user ? $user->id : null,
                'reference' => 'PAY-' . strtoupper(\Illuminate\Support\Str::random(12)),
                'transaction_id' => $paymentData['transaction_id'] ?? null,
                'method' => $method,
                'provider' => $this->getProviderForMethod($method),
                'amount' => $grandTotal,
                'currency' => \Illuminate\Support\Number::defaultCurrency(),
                'status' => $method === 'cash' ? 'pending' : 'completed',
                'paid_at' => $method === 'cash' ? null : now(),
                'details' => isset($data['payment_phone']) ? ['phone' => $data['payment_phone']] : null,
            ]);

            $this->cartService->clear();
            DB::commit();

            rescue(fn() => Mail::to($user->email)->sendNow(new OrderCreated($order)), null, false);
            rescue(fn() => Mail::to($settings->email)->sendNow(new AdminOrderCreated($order)), null, false);

            return response()->json([
                'status' => 'success',
                'order_id' => $order->id,
                'message' => $method === 'cash' ? 'Votre commande est en attente de paiement.' : 'Paiement effectué avec succès. Commande validée.',
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création de la commande : ' . $e->getMessage(),
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
