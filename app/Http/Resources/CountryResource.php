<?php

namespace App\Http\Resources;

use App\Models\Country;
use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        /** @var Country $country */
        $country = $this->resource;

        if ($country === null) {
            return [];
        }

        return [
            'id' => $this->id,
            'iso' => $this->iso,
            'iso3' => $this->iso3,
            'name' => countryName($country),
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'emojiU' => $this->emojiU,
            'phonecode' => $this->phonecode,
            'region' => $this->region,
            'subregion' => $this->subregion,
            'capital' => $this->capital,
        ];
    }
}
