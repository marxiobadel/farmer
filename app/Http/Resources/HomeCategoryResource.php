<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class HomeCategoryResource extends JsonResource
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
            'parent_id' => $this->parent_id,
            'parent' => new CategoryResource($this->whenLoaded('parent')),
            'products' => $this->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'base_price' => $product->base_price,
                    'origin' => $product->origin,
                    'quantity' => $product->quantity,
                    'default_image' => $product->default_image_id
                        ? $product->getMedia('images')->where('id', $product->default_image_id)->first()?->getUrl()
                        : null,
                    'variants' => $product->variants->map(function ($variant) {
                        return [
                            'id' => $variant->id,
                            'sku' => $variant->sku,
                            'price' => $variant->price,
                            'quantity' => $variant->quantity,
                            'is_default' => $variant->is_default,
                            'image' => $variant->getFirstMediaUrl('image'),
                            'options' => $variant->options->map(function ($opt) {
                                return [
                                    'attribute_id' => $opt->attribute_id,
                                    'attribute_option_id' => $opt->attribute_option_id,
                                    'attribute' => optional($opt->attribute)->name,
                                    'option' => optional($opt->option)->name,
                                ];
                            }),
                        ];
                    }),
                ];
            }),
            'slug' => $this->slug,
            'name' => $this->name,
            'type' => $this->type,
            'cover_url' => $this->cover_url,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
