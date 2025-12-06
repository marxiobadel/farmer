<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
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
            'position' => $this->position,
            'company' => $this->company,
            'rating' => $this->rating,
            'message' => $this->message,
            'is_approved' => $this->is_approved,
            'user_id' => $this->user_id,
            'product_id' => $this->product_id,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'fullname' => $this->user->fullname,
                'email' => $this->user->email,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
