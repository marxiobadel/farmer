<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CarrierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // -------------------------------
            // BASIC CARRIER FIELDS
            // -------------------------------
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'free_shipping_min' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'pricing_type' => ['required', Rule::in(['fixed', 'weight', 'price', 'volume'])],
            'rates' => ['nullable', 'array'],
            'rates.*.min_weight' => ['nullable', 'numeric', 'min:0'],
            'rates.*.max_weight' => ['nullable', 'numeric', 'min:0'],
            'rates.*.min_price' => ['nullable', 'numeric', 'min:0'],
            'rates.*.max_price' => ['nullable', 'numeric', 'min:0'],
            'rates.*.min_volume' => ['nullable', 'numeric', 'min:0'],
            'rates.*.max_volume' => ['nullable', 'numeric', 'min:0'],
            'rates.*.rate_price' => ['required', 'numeric', 'min:0'],
            'rates.*.delivery_time' => ['nullable', 'string', 'max:255'],
            'rates.*.zone_id' => ['nullable', 'integer', 'exists:zones,id'],
        ];
    }

    public function messages(): array
    {
        return [

            // -------------------------------
            // BASIC CARRIER FIELDS
            // -------------------------------
            'name.required' => 'Le nom du transporteur est obligatoire.',
            'name.string' => 'Le nom doit être une chaîne de caractères.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',

            'description.string' => 'La description doit être une chaîne de caractères.',

            'base_price.numeric' => 'Le prix de base doit être un nombre.',
            'base_price.min' => 'Le prix de base doit être supérieur ou égal à 0.',

            'free_shipping_min.numeric' => 'Le seuil de gratuité doit être un nombre.',
            'free_shipping_min.min' => 'Le seuil de gratuité doit être supérieur ou égal à 0.',

            'is_active.boolean' => 'Le statut actif doit être vrai ou faux.',

            'pricing_type.required' => 'Le type de tarification est obligatoire.',
            'pricing_type.in' => 'Le type de tarification sélectionné est invalide.',

            'rates.array' => 'La liste des tarifs est invalide.',

            // -------------------------------
            // RATES FIELDS
            // -------------------------------
            'rates.*.min_weight.numeric' => 'Le poids minimum doit être un nombre.',
            'rates.*.min_weight.min' => 'Le poids minimum doit être supérieur ou égal à 0.',

            'rates.*.max_weight.numeric' => 'Le poids maximum doit être un nombre.',
            'rates.*.max_weight.min' => 'Le poids maximum doit être supérieur ou égal à 0.',

            'rates.*.min_price.numeric' => 'Le prix minimum doit être un nombre.',
            'rates.*.min_price.min' => 'Le prix minimum doit être supérieur ou égal à 0.',

            'rates.*.max_price.numeric' => 'Le prix maximum doit être un nombre.',
            'rates.*.max_price.min' => 'Le prix maximum doit être supérieur ou égal à 0.',

            'rates.*.min_volume.numeric' => 'Le volume minimum doit être un nombre.',
            'rates.*.min_volume.min' => 'Le volume minimum doit être supérieur ou égal à 0.',

            'rates.*.max_volume.numeric' => 'Le volume maximum doit être un nombre.',
            'rates.*.max_volume.min' => 'Le volume maximum doit être supérieur ou égal à 0.',

            'rates.*.rate_price.required' => 'Le prix du transport est obligatoire.',
            'rates.*.rate_price.numeric' => 'Le prix du transport doit être un nombre.',
            'rates.*.rate_price.min' => 'Le prix du transport doit être supérieur ou égal à 0.',

            'rates.*.delivery_time.string' => 'Le délai de livraison doit être un texte.',
            'rates.*.delivery_time.max' => 'Le délai de livraison ne peut pas dépasser 255 caractères.',

            'rates.*.zone_id.integer' => 'La zone sélectionnée est invalide.',
            'rates.*.zone_id.exists' => "La zone sélectionnée n'existe pas.",
        ];
    }
}
