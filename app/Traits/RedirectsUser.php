<?php

namespace App\Traits;

trait RedirectsUser
{
    public function redirectUser()
    {
        $user = auth()->user();

        if ($user && $user->can('access-admin')) {
            return redirect()->intended(route('dashboard'));
        }

        return redirect()->intended(route('home'));
    }
}
