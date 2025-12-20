<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ZoneResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        if ($this->resource === null) {
            return [];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'country' => $this->whenLoaded('country', function () {
                return new CountryResource($this->country);
            }),
            'rates' => $this->rates->map(fn ($rate) => [
                'id' => $rate->id,
                'carrier_id' => $rate->carrier_id,
                'min_weight' => $rate->min_weight,
                'max_weight' => $rate->max_weight,
                'min_price' => $rate->min_price,
                'max_price' => $rate->max_price,
                'min_volume' => $rate->min_volume,
                'max_volume' => $rate->max_volume,
                'rate_price' => $rate->rate_price,
                'delivery_time' => $rate->delivery_time,
                'carrier' => [
                    'id' => $rate->carrier->id,
                    'name' => $rate->carrier->name,
                    'description' => $rate->carrier->description,
                    'base_price' => $rate->carrier->base_price,
                    'free_shipping_min' => $rate->carrier->free_shipping_min,
                    'is_active' => $rate->carrier->is_active,
                    'pricing_type' => $rate->carrier->pricing_type,
                ],
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
