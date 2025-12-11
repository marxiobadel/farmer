<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CarrierResource extends JsonResource
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
            'id'            => $this->id,
            'name'          => $this->name,
            'description'   => $this->description,
            'base_price'    => $this->base_price,
            'free_shipping_min' => $this->free_shipping_min,
            'is_active'     => $this->is_active,
            'pricing_type'  => $this->pricing_type,
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,

            'rates' => CarrierRateResource::collection($this->whenLoaded('rates')),
            'zones' => ZoneResource::collection($this->whenLoaded('zones')),
        ];
    }
}
