<?php

namespace App\Http\Requests;

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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'cart_id' => ['required', 'integer', 'exists:carts,id'],

            'shipping_address_id' => ['required', 'integer', 'exists:addresses,id'],
            'billing_address_id' => ['nullable', 'integer', 'exists:addresses,id'],

            'carrier_id' => ['required', 'integer', 'exists:carriers,id'],
            'zone_id' => ['required', 'integer', 'exists:zones,id'],

            'status' => ['required', 'string'],
            'method' => ['required', 'string', 'in:cash,om,momo,stripe,paypal'],
        ];
    }
}
