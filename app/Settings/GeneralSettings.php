<?php

namespace App\Settings;

use Spatie\LaravelSettings\Settings;

class GeneralSettings extends Settings
{
    public string $facebook_url;

    public string $twitter_url;

    public string $instagram_url;

    public string $linkedin_url;

    public string $youtube_url;

    public string $phone;

    public string $email;

    public string $address;

    public string $headoffice;

    public string $budget;

    public string $registration;

    public string $taxpayer_number;

    public static function group(): string
    {
        return 'general';
    }
}
