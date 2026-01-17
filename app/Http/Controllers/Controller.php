<?php

namespace App\Http\Controllers;

use App\Models\Carrier;
use App\Models\CarrierRate;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Zone;
use App\Services\MobileMoney;
use App\Services\OrangeMoney;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Number;
use Illuminate\Support\Str;

abstract class Controller
{
    public function __construct(protected MobileMoney $mobileMoney, protected OrangeMoney $orangeMoney) {}

    protected function calculateShippingCost($carrierId, $zoneId, $metrics, $totalQty = 1)
    {
        // 1. Get Rates for this Zone/Carrier
        $rates = CarrierRate::where('carrier_id', '=', $carrierId)
            ->where('zone_id', '=', $zoneId)
            ->with('carrier')
            ->get();

        // Fallback if no rates found: Check Carrier base price directly
        if ($rates->isEmpty()) {
            $carrier = Carrier::find($carrierId);

            return $carrier ? $carrier->base_price : 0;
        }

        // Get Carrier Config from first rate
        $carrier = $rates->first()->carrier;

        // 2. Check Free Shipping
        if ($carrier->free_shipping_min && $metrics['price'] >= $carrier->free_shipping_min) {
            return 0;
        }

        $basePrice = $carrier->base_price ?? 0;
        $matchedRate = null;

        // 3. Find Matching Rate based on Pricing Type
        switch ($carrier->pricing_type) {
            case 'fixed':
                return $basePrice;

            case 'weight':
                $matchedRate = $rates->first(function ($rate) use ($metrics) {
                    $max = $rate->max_weight ?? INF;

                    return $metrics['weight'] >= $rate->min_weight && $metrics['weight'] <= $max;
                });
                break;

            case 'price':
                $matchedRate = $rates->first(function ($rate) use ($metrics) {
                    $max = $rate->max_price ?? INF;

                    return $metrics['price'] >= $rate->min_price && $metrics['price'] <= $max;
                });
                break;

            case 'volume':
                $matchedRate = $rates->first(function ($rate) use ($metrics) {
                    $max = $rate->max_volume ?? INF;

                    return $metrics['volume'] >= $rate->min_volume && $metrics['volume'] <= $max;
                });
                break;
        }

        if ($matchedRate) {
            if ($matchedRate->coefficient === 'quantity') {
                return $basePrice + ($matchedRate->rate_price * $totalQty);
            } else {
                return $basePrice + $matchedRate->rate_price;
            }
        }

        return $basePrice;
    }

    protected function calculateMetrics($items)
    {
        return $items->reduce(function ($carry, $item) {
            $product = $item->product;

            // Dimensions logic (assuming cm/kg)
            $volume = (($product->length ?? 0) * ($product->width ?? 0) * ($product->height ?? 0)) * $item->quantity;
            $weight = ($product->weight ?? 0) * $item->quantity;
            $price = $item->price * $item->quantity;

            return [
                'weight' => $carry['weight'] + $weight,
                'price' => $carry['price'] + $price,
                'volume' => $carry['volume'] + $volume,
            ];
        }, ['weight' => 0, 'price' => 0, 'volume' => 0]);
    }

    protected function calculateTotalQty($items): int
    {
        return $items->reduce(fn ($carry, $item) => $carry + $item->quantity, 0);
    }

    protected function getZoneIdFromRequest(Request $request)
    {
        // Si le front envoie directement zone_id (recommandé)
        if ($request->filled('zone_id')) {
            return $request->input('zone_id');
        }

        // Sinon, on cherche la zone qui contient le pays de livraison
        $countryId = $request->input('shipping_address.country_id');
        $zone = Zone::whereRelation('countries', 'id', '=', $countryId)->first();

        return $zone ? $zone->id : null;
    }

    protected function getProviderForMethod($method)
    {
        return match ($method) {
            'credit_card' => 'stripe',
            'orange_money', 'om' => 'orange_money',
            'mtn_money', 'momo' => 'mtn_momo',
            'paypal' => 'paypal',
            'cash' => 'manual',
            default => 'manual',
        };
    }

    /**
     * Load the shared data for both create/edit forms.
     */
    protected function loadOrderFormData(): array
    {
        return Concurrency::driver('sync')->run([
            fn () => Product::with('variants.options')->latest()->get(),
            fn () => User::with('addresses')->latest('firstname')->get(),
            fn () => Zone::with('rates.carrier')->get(),
        ]);
    }

    protected function payment(Order $order, $data)
    {
        $messages = [
            'successful' => 'Paiement OM a été effectué avec succès.',
            'successfull' => 'Paiement MoMo a été effectué avec succès.',
            'cancelled' => 'Paiement annulé.',
            'failed' => 'Paiement échoué.',
            'expired' => 'Paiement expiré.',
        ];

        if ((float) $order->total < 10) {
            throw new Exception('Au moins 10 FCFA pour effectuer une recharge.');
        }

        $maxAttempts = 20;

        $method = data_get($data, 'method', data_get($data, 'payment_method'));

        switch ($method) {
            case 'orange_money':
                $result = $this->orangeMoney->webPayment([
                    'amount' => (string) $order->total,
                    'subscriberMsisdn' => $data['payment_phone'],
                ]);

                $payToken = $result['data']['payToken'] ?? null;

                if (! $payToken) {
                    throw new Exception('Paiement OM non initié.');
                }

                $payment = $this->buildPayment(
                    $order,
                    $data,
                    ['payToken' => $payToken, 'txnid' => $result['data']['txnid'] ?? null]
                );

                $status = $this->waitForTransaction(function () use ($payToken) {
                    return $this->orangeMoney->checkTransactionStatus($payToken)['data']['status'] ?? 'pending';
                }, $maxAttempts);

                $payment->status = $status;

                if (in_array($status, ['successful', 'successfull'])) {
                    $order->status = 'completed';
                    $order->save();
                    $payment->status = 'completed';
                } elseif (in_array($status, ['failed', 'cancelled', 'expired'])) {
                    throw new Exception($messages[$status]);
                }

                $payment->save();

                return [
                    'status' => 'success',
                    'order_id' => $order->id,
                    'message' => $messages[$status] ?? 'Paiement OM en cours de traitement.',
                ];
            case 'mtn_money':
                $result = $this->mobileMoney->webPayment([
                    'amount' => (string) $order->total,
                    'subscriberMsisdn' => $data['payment_phone'],
                ]);

                $messageId = $result['MessageId'] ?? $result['parameters']['MessageId'] ?? null;

                if (! $messageId) {
                    throw new Exception('Paiement MoMo non initié.');
                }

                $payment = $this->buildPayment(
                    $order,
                    $data,
                    ['MessageId' => $messageId]
                );

                $status = $this->waitForTransaction(function () use ($messageId) {
                    return $this->mobileMoney->checkTransactionStatus($messageId)['status'] ?? 'pending';
                }, $maxAttempts);

                $payment->status = $status;

                if (in_array($status, ['successful', 'successfull'])) {
                    $order->status = 'completed';
                    $order->save();
                    $payment->status = 'completed';
                } elseif (in_array($status, ['failed', 'cancelled', 'expired'])) {
                    throw new Exception($messages[$status]);
                }

                $payment->save();

                return [
                    'status' => 'success',
                    'order_id' => $order->id,
                    'message' => $messages[$status] ?? 'Paiement MoMo en cours de traitement.',
                ];
            case 'cash':
                $this->buildPayment($order, $data, []);

                return [
                    'status' => 'success',
                    'order_id' => $order->id,
                    'message' => 'Votre commande est en attente de paiement.',
                ];
            default:
                throw new Exception("Quelque chose s'est mal passée.");
        }
    }

    protected function waitForTransaction(callable $checkStatus, int $maxAttempts)
    {
        $attempt = 0;
        do {
            sleep(2);
            $status = strtolower($checkStatus());
            $attempt++;
        } while (! in_array($status, ['successful', 'successfull', 'cancelled', 'expired', 'failed']) && $attempt < $maxAttempts);

        return $status;
    }

    protected function buildPayment(Order $order, $data, $paymentData)
    {
        $paymentDetails = isset($data['payment_phone']) ? ['phone' => $data['payment_phone']] : null;

        $method = data_get($data, 'method', data_get($data, 'payment_method'));

        return $order->payments()->create([
            'user_id' => Auth::id(),
            'reference' => 'PAY-'.strtoupper(Str::random(12)),
            'transaction_id' => $paymentData['payToken'] ?? $paymentData['MessageId'] ?? null, // Will be filled by payment gateway callback if online
            'method' => $method,
            'provider' => $this->getProviderForMethod($method), // helper to determine provider
            'amount' => $order->total,
            'currency' => Number::defaultCurrency(),
            'status' => 'pending',
            'paid_at' => now(),
            'details' => $paymentDetails,
        ]);
    }
}
