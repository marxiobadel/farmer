<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Si tu utilises des policies, change ici
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],

            // Latitude et longitude optionnelles
            'latitude'   => ['nullable', 'string', 'max:255'],
            'longitude'  => ['nullable', 'string', 'max:255'],

            // Country ID optionnel mais doit exister
            'country_id' => ['nullable', 'integer', 'exists:countries,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'        => "Le nom de la zone est obligatoire.",
            'name.string'          => "Le nom doit être une chaîne de caractères.",
            'name.max'             => "Le nom ne peut pas dépasser 255 caractères.",

            'latitude.string'      => "La latitude doit être une chaîne de caractères.",
            'longitude.string'     => "La longitude doit être une chaîne de caractères.",

            'country_id.integer'   => "Le pays sélectionné est invalide.",
            'country_id.exists'    => "Le pays sélectionné n'existe pas.",
        ];
    }
}
