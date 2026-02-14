<?php

namespace App\Http\Resources;

use App\Services\CartService;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
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

        $cartService = app(CartService::class);

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'firstname' => $this->user->firstname,
                    'lastname' => $this->user->lastname,
                    'fullname' => $this->user->fullname,
                    'email' => $this->user->email,
                    'phone' => $this->user->phone,
                ];
            }, null),
            'items' => CartItemResource::collection($this->items),
            'coupon' => $this->whenLoaded('coupon', new CouponResource($this->coupon)),
            'total_qty' => $this->items->sum('quantity'),
            'subtotal' => $cartService->getSubtotal(), // Si vous ajoutez cette méthode helper
            'discount_amount' => $cartService->getDiscountAmount(),
            'total' => $cartService->getTotal(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
