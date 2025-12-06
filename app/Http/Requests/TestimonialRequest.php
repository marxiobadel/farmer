<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TestimonialRequest extends FormRequest
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
            'name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'is_approved' => 'boolean',
            'message' => 'required|string|max:1000',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:0|max:5',
            'product_id' => 'required|exists:products,id',
        ];
    }
}
