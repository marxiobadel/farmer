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
            'role_name' => 'required|in:visitor,customer,admin,superadmin',
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

            'addresses' => 'nullable|array',
            'addresses.*.alias' => 'required|string|max:255',
            'addresses.*.firstname' => 'required|string|max:255',
            'addresses.*.lastname' => 'required|string|max:255',
            'addresses.*.phone' => 'nullable|string|max:20',
            'addresses.*.address' => 'required|string|max:255',
            'addresses.*.city' => 'required|string|max:255',
            'addresses.*.state' => 'nullable|string|max:255',
            'addresses.*.postal_code' => 'nullable|string|max:20',
            'addresses.*.country_id' => 'required|integer|exists:countries,id',
            'addresses.*.is_default' => 'boolean',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $addresses = $this->input('addresses', []);

            // Count how many default addresses are selected
            $defaultCount = collect($addresses)
                ->where('is_default', '=', true)
                ->count();

            if ($defaultCount > 1) {
                $validator->errors()->add(
                    'addresses',
                    'Une seule adresse peut être définie comme adresse par défaut.'
                );
            }
        });
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
            'role_name' => 'rôle',
            'is_active' => 'statut actif',
            'address' => 'adresse',
            'email' => 'e-mail',
            'password' => 'mot de passe',
            'password_confirmation' => 'confirmation du mot de passe',
            'addresses.*.alias' => 'alias',
            'addresses.*.firstname' => 'prénom',
            'addresses.*.lastname' => 'nom',
            'addresses.*.phone' => 'téléphone',
            'addresses.*.city' => 'ville',
            'addresses.*.country_id' => 'pays',
            'addresses.*.address' => 'adresse complète',
            'addresses.*.is_default' => 'adresse par défaut',
        ];
    }

    /**
     * Custom messages (optional, but makes UX more professional).
     */
    public function messages(): array
    {
        return [
            // Champs généraux
            'lastname.required' => 'Le nom est obligatoire.',
            'lastname.string' => 'Le nom doit être une chaîne de caractères.',
            'lastname.max' => 'Le nom ne peut pas dépasser :max caractères.',

            'firstname.required' => 'Le prénom est obligatoire.',
            'firstname.string' => 'Le prénom doit être une chaîne de caractères.',
            'firstname.max' => 'Le prénom ne peut pas dépasser :max caractères.',

            'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le numéro de téléphone ne peut pas dépasser :max caractères.',

            'role_name.required' => 'Le rôle est obligatoire.',
            'role_name.in' => 'Le rôle sélectionné est invalide.',

            'is_active.required' => 'Le statut actif est obligatoire.',
            'is_active.boolean' => 'Le statut actif doit être vrai ou faux.',

            'address.string' => "L'adresse doit être une chaîne de caractères.",
            'address.max' => "L'adresse ne peut pas dépasser :max caractères.",

            // Email
            'email.required' => "L'adresse e-mail est obligatoire.",
            'email.string' => "L'adresse e-mail doit être une chaîne de caractères.",
            'email.email' => "L'adresse e-mail doit être valide.",
            'email.max' => "L'adresse e-mail ne peut pas dépasser :max caractères.",
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',

            // Mot de passe
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password.min' => 'Le mot de passe doit contenir au moins :min caractères.',

            // Messages génériques
            'required' => 'Le champ :attribute est obligatoire.',
            'string' => 'Le champ :attribute doit être une chaîne de caractères.',
            'max' => 'Le champ :attribute ne peut pas dépasser :max caractères.',
            'email' => 'Le champ :attribute doit être une adresse e-mail valide.',
            'unique' => 'Cette valeur est déjà utilisée.',
            'boolean' => 'Le champ :attribute doit être vrai ou faux.',
            'in' => 'La valeur sélectionnée pour :attribute est invalide.',
            'confirmed' => 'La confirmation de :attribute ne correspond pas.',
        ];
    }
}
