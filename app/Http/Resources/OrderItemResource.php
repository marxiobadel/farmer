<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
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
            'order_id' => $this->order_id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'product' => $this->whenLoaded('product', function () {
                return [
                    'id' => $this->product->id,
                    'name' => $this->product->name,
                ];
            }),
            'variant' => $this->variant ? $this->variant->options->map(fn ($o) => [
                'attribute' => $o->attribute->name,
                'option' => $o->option->name,
            ]) : null,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'total' => $this->price * $this->quantity,
            'image' => $this->variant?->image_url,
        ];
    }
}
