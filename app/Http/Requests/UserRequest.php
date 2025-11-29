<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UserRequest extends FormRequest
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
        $userId = $this->route('user')?->id;

        return [
            'lastname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'phone' => ['nullable', 'string', 'max:20'],
            'role_name' => 'required|in:teacher,student,superadmin',
            'is_active' => 'required|boolean',
            'address' => 'nullable|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($userId),
            ],
            // Mot de passe requis à la création, facultatif à la mise à jour
            'password' => $userId
                ? ['nullable', 'confirmed', Rules\Password::defaults()]
                : ['required', 'confirmed', Rules\Password::defaults()],
        ];
    }

    /**
     * Custom attribute names (for user-friendly validation messages).
     */
    public function attributes(): array
    {
        return [
            'firstname' => 'prénom',
            'lastname' => 'nom',
            'phone' => 'téléphone',
            'email' => 'e-mail',
            'password' => 'mot de passe',
            'password_confirmation' => 'confirmation du mot de passe',
        ];
    }

    /**
     * Custom messages (optional, but makes UX more professional).
     */
    public function messages(): array
    {
        return [
            'required' => 'Le champ :attribute est obligatoire.',
            'email' => "L'adresse e-mail doit être valide.",
            'unique' => "L'adresse e-mail est déjà utilisée.",
            'min' => 'Le champ :attribute doit contenir au moins :min caractères.',
            'confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ];
    }
}
