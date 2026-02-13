<?php

namespace App\Http\Resources;

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
            'total_qty' => $this->items->sum('quantity'),
            'subtotal' => $this->items->sum(fn ($item) => $item->price * $item->quantity),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
