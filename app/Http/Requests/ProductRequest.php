<?php

namespace App\Http\Requests;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ---------------------------------
            // BASIC PRODUCT FIELDS
            // ---------------------------------
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'meta_description' => ['nullable', 'string', 'max:500'],

            // Required only when NO variants exist
            'price' => ['nullable', 'required_without:variants', 'numeric', 'min:0'],
            'quantity' => ['nullable', 'required_without:variants', 'integer', 'min:0'],

            'weight' => ['nullable', 'numeric', 'min:0'],
            'height' => ['nullable', 'numeric', 'min:0'],
            'width' => ['nullable', 'numeric', 'min:0'],
            'length' => ['nullable', 'numeric', 'min:0'],

            'status' => ['required', Rule::in(ProductStatus::values())],

            // ---------------------------------
            // CATEGORIES
            // ---------------------------------
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'exists:categories,id'],

            // ---------------------------------
            // TAGS
            // ---------------------------------
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],

            // ---------------------------------
            // IMAGES (MAIN PRODUCT IMAGES)
            // ---------------------------------
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'image', 'max:5120'], // 5MB

            'default_image' => ['nullable', 'string'],

            // ---------------------------------
            // ATTRIBUTES
            // ---------------------------------
            'attributes' => ['nullable', 'array'],
            'attributes.*.name' => ['required_with:attributes', 'string', 'max:255'],
            'attributes.*.options' => ['required_with:attributes.*.name', 'array', 'min:1'],
            'attributes.*.options.*.name' => [
                'required_with:attributes.*.options',
                'string',
                'max:255'
            ],

            // ---------------------------------
            // VARIANTS
            // ---------------------------------
            'variants' => ['nullable', 'array'],

            'variants.*.name' => [
                'required_with:variants',
                'string',
                'max:255',
            ],

            'variants.*.price' => [
                'required_with:variants',
                'numeric',
                'min:0'
            ],

            'variants.*.quantity' => [
                'required_with:variants',
                'integer',
                'min:0'
            ],

            'variants.*.is_default' => ['boolean'],

            // Variant single image file
            'variants.*.image' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    if ($value instanceof \Illuminate\Http\UploadedFile) {
                        // Validate file
                        if (!in_array($value->extension(), ['jpg', 'jpeg', 'png', 'webp'])) {
                            $fail("L'image de la variante doit être une image valide.");
                        }
                        if ($value->getSize() > 5 * 1024 * 1024) {
                            $fail("L'image de la variante ne doit pas dépasser 5MB.");
                        }
                    } elseif (is_string($value)) {
                        // Validate URL
                        if (!filter_var($value, FILTER_VALIDATE_URL)) {
                            $fail("Le champ $attribute doit être une URL valide.");
                        }
                    }
                }
            ], // 5MB
        ];
    }

    public function messages(): array
    {
        return [
            // Basic fields
            'name.required' => 'Le nom du produit est obligatoire.',
            'description.required' => 'La description est obligatoire.',

            // Categories
            'category_ids.required' => 'Veuillez sélectionner au moins une catégorie.',

            // Variants
            'variants.*.name.required_with' => 'Chaque variante doit avoir un nom.',
            'variants.*.price.required_with' => 'Chaque variante doit avoir un prix.',
            'variants.*.quantity.required_with' => 'Chaque variante doit avoir une quantité.',
            'variants.*.image.image' => "L'image de la variante doit être une image valide.",
        ];
    }

    /**
     * After validation, enforce:
     * - Only ONE default variant
     * - Variant names MUST be unique
     */
    protected function passedValidation(): void
    {
        $variants = $this->input('variants', []);

        if (!empty($variants)) {
            // Ensure ONLY ONE variant is_default = true
            $defaultCount = collect($variants)->where('is_default', true)->count();

            if ($defaultCount > 1) {
                $this->errors()->add(
                    'variants',
                    'Une seule variante peut être définie comme par défaut.'
                );
            }

            // Ensure variant names are unique
            $names = collect($variants)->pluck('name');

            if ($names->duplicates()->count() > 0) {
                $this->errors()->add(
                    'variants',
                    'Les noms des variantes doivent être uniques.'
                );
            }
        }
    }
}
