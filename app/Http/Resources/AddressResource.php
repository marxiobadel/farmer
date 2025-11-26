<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
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
            'alias' => $this->alias,
            'address' => $this->address,
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'phone' => $this->phone,
            'city' => $this->city,
            'street' => $this->street,
            'postal_code' => $this->postal_code,
            'is_default' => $this->is_default,
            'state' => $this->state,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'firstname' => $this->user->firstname,
                    'lastname' => $this->user->lastname,
                    'fullname' => $this->user->fullname,
                    'email' => $this->user->email,
                ];
            }),
            'country' => new CountryResource($this->whenLoaded('country')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
