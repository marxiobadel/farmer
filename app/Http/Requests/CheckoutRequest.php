<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
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
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],

            // --- Adresse de Livraison (Toujours requise) ---
            'shipping_address' => ['required', 'array'],
            'shipping_address.alias' => ['required', 'string', 'max:50'],
            'shipping_address.address' => ['required', 'string', 'max:255'], // Rue / Quartier
            'shipping_address.state' => ['nullable', 'string', 'max:100'],
            'shipping_address.postal_code' => ['nullable', 'string', 'max:20'],
            'shipping_address.country_id' => ['required', 'exists:countries,id'],

            // --- Adresse de Facturation (Conditionnelle) ---
            'use_billing_address' => ['required', 'boolean'],

            // Si use_billing_address est false, alors l'objet billing_address est requis
            'billing_address' => ['exclude_if:use_billing_address,false', 'required', 'array'],
            'billing_address.address' => ['exclude_if:use_billing_address,false', 'required', 'string', 'max:255'],
            'billing_address.city' => ['exclude_if:use_billing_address,false', 'required', 'string', 'max:100'],

            // --- Options et Logistique ---
            'save_address' => ['boolean'], // Checkbox "Enregistrer dans mon carnet"
            'carrier_id' => ['required', 'integer', 'exists:carriers,id'],

            // --- Paiement ---
            'payment_method' => ['required', 'string', Rule::in(['orange_money', 'mtn_money', 'cash'])],

            // Le numéro de paiement est requis uniquement si ce n'est pas du cash
            'payment_phone' => [
                'nullable',
                Rule::requiredIf(fn () => in_array($this->payment_method, ['orange_money', 'mtn_money'])),
                'string',
                'max:20',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'carrier_id.required' => 'Veuillez sélectionner un mode de livraison.',
            'payment_phone.required_if' => 'Le numéro de téléphone est requis pour le paiement mobile.',
            'shipping_address.alias.required' => 'Le champ alias est requis.',
            'shipping_address.state.required' => 'Le champ région est requis.',
            'shipping_address.country_id.required' => 'Veuillez sélectionner un pays de livraison.',
            'shipping_address.city.required' => 'Le champ ville est obligatoire.',
            'shipping_address.address.required' => 'Le champ adresse est obligatoire.',
            'shipping_address.postal_code.required' => 'Le code postal est obligatoire.',
            'payment_phone.required' => 'Le numéro de téléphone de paiement est requis.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Si besoin de nettoyer des données avant validation
        // Par exemple, si payment_phone contient des espaces, on peut les retirer ici.
        if ($this->has('payment_phone') && $this->payment_phone) {
            $this->merge([
                'payment_phone' => str_replace(' ', '', $this->payment_phone),
            ]);
        }
    }
}
