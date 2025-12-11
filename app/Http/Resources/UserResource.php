<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'firstname' => $this->firstname,
            'lastname' => $this->lastname,
            'fullname' => $this->fullname,
            'phone' => $this->phone,
            'address' => $this->address,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'status' => $this->status,
            'roles' => $this->roles->pluck('name'),
            'country' => $this->whenLoaded('country', function () {
                return new CountryResource($this->country);
            }),
            'addresses' => AddressResource::collection($this->addresses),
            'is_active' => $this->is_active,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
