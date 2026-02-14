<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'user_id' => $this->user_id,
            'carrier_id' => $this->carrier_id,
            'status' => $this->status,
            'total' => $this->total,
            'discount' => $this->discount,
            'coupon_code' => $this->coupon_code,
            'items' => OrderItemResource::collection($this->items),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'firstname' => $this->user->firstname,
                    'lastname' => $this->user->lastname,
                    'fullname' => $this->user->fullname,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                ];
            }),
            'carrier' => $this->whenLoaded('carrier', function () {
                return [
                    'id' => $this->carrier->id,
                    'name' => $this->carrier->name,
                    'pricing_type' => $this->carrier->pricing_type,
                ];
            }),
            'payments' => PaymentResource::collection($this->payments),
            'shipping_address' => $this->shipping_address,
            'invoice_address' => $this->invoice_address,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
