<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
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

            // Relations
            'order_id' => $this->order_id,
            'user_id' => $this->user_id,

            // Identifiers
            'reference' => $this->reference,
            'transaction_id' => $this->transaction_id,

            // Details
            'method' => $this->method,
            'provider' => $this->provider,

            // Money
            'amount' => (float) $this->amount,
            'currency' => $this->currency,

            // Status
            'status' => $this->status,

            // Raw provider response
            'details' => $this->details ?? null,

            // Dates
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
