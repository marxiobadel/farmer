<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        switch ($this->page) {
            case 'account':
                return [
                    'lastname' => 'required|string|max:255',
                    'firstname' => 'required|string|max:255',
                    'email' => [
                        'required',
                        'string',
                        'lowercase',
                        'email',
                        'max:255',
                        Rule::unique(User::class)->ignore($this->user()->id),
                    ],
                    'phone' => 'nullable|string|max:255',
                    'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
                ];
            case 'link':
                return [
                    'instagram' => 'nullable|url|max:255',
                    'facebook' => 'nullable|url|max:255',
                    'twitter' => 'nullable|url|max:255',
                    'youtube' => 'nullable|url|max:255',
                ];
            case 'general':
            default:
                return [];
        }
    }
}
