<?php

use App\Models\Country;
use Illuminate\Support\Number;
use Illuminate\Support\Str;

if (! function_exists('generateUniqueRef')) {
    function generateUniqueRef($modelClass, $column = 'reference', int $length = 8, ?string $prefix = null)
    {
        do {
            $reference = ($prefix ?? '').Str::upper(Str::random($length));
        } while ($modelClass::where($column, $reference)->exists());

        return $reference;
    }
}

if (! function_exists('toCurrency')) {
    function toCurrency(int|float $amount)
    {
        return Number::currency($amount);
    }
}

if (! function_exists('toPercentage')) {
    function toPercentage(int|float $number, $maxPrecision = 2)
    {
        return Number::percentage($number, maxPrecision: $maxPrecision);
    }
}

if (! function_exists('toAbbreviate')) {
    function toAbbreviate(int|float $number, $maxPrecision = 2)
    {
        return Number::abbreviate($number, maxPrecision: $maxPrecision);
    }
}

if (! function_exists('toFormat')) {
    function toFormat(int|float $number, $maxPrecision = 2)
    {
        return Number::format($number, maxPrecision: $maxPrecision);
    }
}

if (! function_exists('plural')) {
    function plural(string $value, int $count = 2)
    {
        return Str::plural($value, max($count, 1));
    }
}

if (! function_exists('generateHexColor')) {
    function generateHexColor()
    {
        return '#'.substr(str_shuffle('ABCDEF0123456789'), 0, 6);
    }
}

if (! function_exists('generateMultipleHexColors')) {
    function generateMultipleHexColors($count = 1)
    {
        $colors = [];

        for ($i = 0; $i < $count; $i++) {
            $colors[] = generateHexColor();
        }

        return $colors;
    }
}

if (! function_exists('urlExists')) {
    /**
     * Check if a URL returns a valid response (200).
     */
    function urlExists(string $url): bool
    {
        $headers = @get_headers($url);

        return $headers && strpos($headers[0], '200') !== false;
    }
}

if (! function_exists('countryName')) {
    function countryName(Country $country)
    {
        $frenchName = $country->nicename;

        if (! app()->isLocale('fr')) {
            return $frenchName;
        }

        $countriesData = json_decode(file_get_contents(storage_path('countries.json')), true);

        foreach ($countriesData as $data) {
            if ($data['iso2'] === $country->iso) {
                $frenchName = $data['translations']['fr'] ?? $frenchName;
                break;
            }
        }

        return $frenchName;
    }
}
