<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CarrierRateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'min_weight'    => $this->min_weight,
            'max_weight'    => $this->max_weight,
            'min_price'     => $this->min_price,
            'max_price'     => $this->max_price,
            'min_volume'    => $this->min_volume,
            'max_volume'    => $this->max_volume,
            'rate_price'    => $this->rate_price,
            'delivery_time' => $this->delivery_time,

            'carrier_id'    => $this->carrier_id,
            'zone_id'       => $this->zone_id,

            // Relation optionnelle
            'zone'          => new ZoneResource($this->whenLoaded('zone')),
        ];
    }
}
