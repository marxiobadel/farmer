<?php

namespace App\Http\Middleware;

use App\Http\Resources\AuthUserResource;
use App\Settings\GeneralSettings;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Number;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $settings = app(GeneralSettings::class);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? new AuthUserResource($request->user()) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'defaultCurrency' => Number::defaultCurrency(),
            'settings' => [
                'address' => $settings->address,
                'email' => $settings->email,
                'phone' => $settings->phone,
                'facebook_url' => $settings->facebook_url,
                'instagram_url' => $settings->instagram_url,
                'linkedin_url' => $settings->linkedin_url,
                'twitter_url' => $settings->twitter_url,
                'youtube_url' => $settings->youtube_url,
            ],
        ];
    }
}
