<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray($request): array
    {
        if ($this->resource === null) {
            return [];
        }

        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'type' => $this->type,
            'stock_before' => $this->stock_before,
            'stock_after' => $this->stock_after,
            'note' => $this->note,
            'created_at' => $this->created_at,

            // Relationships
            'user' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->firstname . ' ' . $this->user->lastname,
            ]),

            'product' => $this->whenLoaded('product', fn() => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'image' => $this->product->getFirstMediaUrl('images'), // Assuming Spatie Media
            ]),

            'variant' => $this->whenLoaded('variant', fn() => $this->variant ? [
                'id' => $this->variant->id,
                'sku' => $this->variant->sku,
                'name' => $this->variant->options
                    ->map(function ($opt) {
                        return $opt->attribute->name . ': ' . $opt->option->name;
                    })
                    ->implode(' / ') ?? 'Default'
            ] : null),

            // Polymorphic Reference Formatting
            'reference' => $this->formatReference(),
        ];
    }

    private function formatReference()
    {
        if (!$this->reference)
            return null;

        $type = class_basename($this->reference_type); // e.g., "Order"

        return [
            'type' => $type,
            'id' => $this->reference->id,
            'label' => $type === 'Order'
                ? "Commande #{$this->reference->id}"
                : "{$type} #{$this->reference->id}",
            // Helper for frontend routing
            'route_name' => $type === 'Order' ? 'admin.orders.show' : null,
        ];
    }
}
