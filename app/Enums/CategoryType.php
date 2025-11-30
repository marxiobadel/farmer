<?php

namespace App\Enums;

enum CategoryType: string
{
    case PRODUCTS = 'products';
    case POSTS = 'posts';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::PRODUCTS => __('Produits'),
            self::POSTS => __('Articles'),
        };
    }
}
