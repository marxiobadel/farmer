<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Number;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Supprime l'enveloppe "data" par défaut dans les ressources JSON (API)
        JsonResource::withoutWrapping();

        // Définit la langue utilisée pour le formatage des nombres (ex. : séparateur décimal, milliers)
        Number::useLocale(App::getLocale());

        // Définit la devise par défaut à utiliser pour le formatage monétaire
        Number::useCurrency('XAF');

        // Implicitly grant "Super Admin" role all permissions
        // This works in the app by using gate-related functions like auth()->user->can() and @can()
        Gate::before(fn ($user, $ability) => $user->hasRole('superadmin') ? true : null);
    }
}
