<?php

namespace App\Http\Requests;

use App\Models\Coupon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponRequest extends FormRequest
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
        $couponId = $this->route('coupon')?->id;

        return [
            'code' => [
                'required',
                'string',
                'uppercase',
                'max:255',
                Rule::unique(Coupon::class)->ignore($couponId),
            ],
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric',
            'min_order_amount' => 'nullable|numeric',
            'expires_at' => 'nullable|date|after_or_equal:today',
            'usage_limit' => 'nullable|integer',
            'is_active' => 'required|boolean',
        ];
    }
}
