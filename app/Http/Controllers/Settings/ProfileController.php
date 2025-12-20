<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateRequest;
use App\Settings\GeneralSettings;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function settings(Request $request, string $page): Response
    {
        if (! in_array($page, config('services.settings_routes'))) {
            abort(404);
        }

        $user = $request->user();

        $props = [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ];

        if ($page === 'two-factor') {
            $props = array_merge($props, [
                'twoFactorEnabled' => $user->hasEnabledTwoFactorAuthentication(),
                'requiresConfirmation' => Features::optionEnabled(
                    Features::twoFactorAuthentication(),
                    'confirm'
                ),
            ]);
        }

        return Inertia::render("admin/settings/{$page}", $props);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(UpdateRequest $request, GeneralSettings $settings, string $page): RedirectResponse
    {
        if ($page === 'account') {
            $request->user()->fill($request->validated());

            if ($request->user()->isDirty('email')) {
                $request->user()->email_verified_at = null;
            }

            $request->user()->save();

            if ($request->hasFile('image')) {
                $request->user()->addMediaFromRequest('image')->toMediaCollection('profile');
            }
        } else {
            if ($page === 'general') {
                foreach (config('services.app_settings') as $field) {
                    $settings->{$field} = (string) ($request->input($field) ?? '');
                }
            }

            $settings->save();
        }

        return to_route('admin.settings.page', compact('page'));
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect(route('home'));
    }
}
