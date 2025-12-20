<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttributeResource extends JsonResource
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
            'options' => AttributeOptionResource::collection($this->options),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
