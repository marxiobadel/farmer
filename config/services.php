<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'settings_routes' => [
        'general',
        'account',
        'appearance',
        'two-factor',
        'password',
    ],

    'app_settings' => [
        'address',
        'email',
        'phone',
        'facebook_url',
        'instagram_url',
        'linkedin_url',
        'twitter_url',
        'youtube_url',
        'headoffice',
        'budget',
        'registration',
        'taxpayer_number',
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
    ],

    'interconnect_sms' => [
        'url' => env('INTERCONNECT_SMS_URL', 'https://portal.interconnect.solutions/api/json.php'),
        'api_key' => env('INTERCONNECT_SMS_API_KEY'),
    ],

    'om' => [
        'auth_header' => env('OM_AUTH_HEADER'),
        'merchant_key' => env('OM_MERCHANT_KEY'),
        'username' => env('USERNAME', '1s6misFgzvpfgYi4zvoD6CIMM88a'),
        'password' => env('PASSWORD', 'KrUzcvPFfGTdNfDzTMBgIHjqfVka'),
        'channel_user_msisdn' => env('CHANNEL_USER_MSISDN', '659923683'),
        'pin' => env('PIN', 1256),
        'x_auth_token' => env('X_AUTH_TOKEN', 'WU5PVEVIRUFEOllOT1RFSEVBRDIwMjA='),

        'ynote_om_client_id' => env('YNOTE_OM_CLIENT_ID'),
        'ynote_om_client_secret' => env('YNOTE_OM_CLIENT_SECRET'),
        'ynote_om_customer_key' => env('YNOTE_OM_CUSTOMER_KEY'),
        'ynote_om_customer_secret' => env('YNOTE_OM_CUSTOMER_SECRET'),
    ],

    'momo' => [
        'access_key' => env('MOMO_ACCESS_KEY'),
        'secret_access_key' => env('MOMO_SECRET_ACCESS_KEY'),
        'client_id' => env('MOMO_CLIENT_ID'),
        'client_secret' => env('MOMO_CLIENT_SECRET'),
    ],

    'frontend_routes' => [
        ['uri' => 'about', 'action' => 'about', 'name' => 'about'],
        ['uri' => 'faqs', 'action' => 'faqs', 'name' => 'faqs'],
        ['uri' => 'farming', 'action' => 'farming', 'name' => 'farming'],
        ['uri' => 'privacy', 'action' => 'privacy', 'name' => 'privacy'],
        ['uri' => 'legal', 'action' => 'legal', 'name' => 'legal'],
        ['uri' => 'cgv', 'action' => 'cgv', 'name' => 'cgv'],
    ],
];
