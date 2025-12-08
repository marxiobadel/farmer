<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'slug' => $this->slug,
            'base_price' => $this->base_price,
            'quantity' => $this->quantity,
            'weight' => $this->weight,
            'height' => $this->height,
            'width' => $this->width,
            'length' => $this->length,
            'short_description' => $this->short_description,
            'tags' => $this->tagsWithType()->pluck('name'),
            'description' => $this->description,
            'status' => $this->status,
            'default_image_id' => $this->default_image_id,
            'default_image' => $this->default_image_id
                ? $this->getMedia('images')->where('id', $this->default_image_id)->first()?->getUrl()
                : null,
            'images' => $this->getMedia('images')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->getUrl(),
                ];
            }),
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                    ];
                });
            }),
            'attributes' => $this->whenLoaded('attributes', function () {
                return $this->attributes->map(function ($attribute) {
                    return [
                        'id' => $attribute->id,
                        'name' => $attribute->name,
                        'type' => $attribute->type,
                        'options' => $attribute->options->map(function ($option) {
                            return [
                                'id' => $option->id,
                                'name' => $option->name,
                            ];
                        }),
                    ];
                });
            }),
            'variants' => $this->whenLoaded('variants', function () {
                return $this->variants->map(function ($variant) {
                    return [
                        'id' => $variant->id,
                        'sku' => $variant->sku,
                        'price' => $variant->price,
                        'quantity' => $variant->quantity,
                        'is_default' => $variant->is_default,

                        // Variant image
                        'image' => $variant->getFirstMediaUrl('image'),

                        // Variant → selected attribute options
                        'options' => $variant->options->map(function ($opt) {
                            return [
                                'attribute_id' => $opt->attribute_id,
                                'attribute_option_id' => $opt->attribute_option_id,
                                'attribute' => $opt->attribute->name,
                                'option' => $opt->option->name,
                            ];
                        }),
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
