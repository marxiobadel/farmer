<?php

namespace App\Http\Requests\Profile;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
            'shipping_address_id' => ['required', 'integer', 'exists:addresses,id'],
            'billing_address_id' => ['nullable', 'integer', 'exists:addresses,id'],

            'carrier_id' => ['required', 'integer', 'exists:carriers,id'],
            'zone_id' => ['required', 'integer', 'exists:zones,id'],

            'method' => ['required', 'string', 'in:cash,orange_money,mtn_money'],
            'payment_phone' => ['nullable'],
        ];
    }
}
