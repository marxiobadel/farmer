<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
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
            'cart_id' => $this->cart_id,
            'product_id' => $this->product_id,
            'variant_id' => $this->variant_id,
            'name' => $this->product?->name,
            'variant' => $this->variant ? $this->variant->options->map(fn ($o) => [
                'attribute' => $o->attribute->name,
                'option' => $o->option->name,
            ]) : null,
            'product' => $this->product ? [
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'default_image' => $this->product->default_image_id
                    ? $this->product->getMedia('images')->where('id', $this->product->default_image_id)->first()?->getUrl()
                    : null,
            ] : null,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'total' => $this->quantity * $this->price,
            'image' => $this->variant?->image_url,
        ];
    }
}
