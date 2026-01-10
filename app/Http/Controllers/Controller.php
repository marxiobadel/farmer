<?php

namespace App\Http\Controllers;

use App\Models\Carrier;
use App\Models\CarrierRate;
use App\Models\Zone;
use Illuminate\Http\Request;

abstract class Controller
{
    protected function calculateShippingCost($carrierId, $zoneId, $metrics)
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
        $ratePrice = 0;
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
            $ratePrice = $matchedRate->rate_price;
        }

        return $basePrice + $ratePrice;
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
}
