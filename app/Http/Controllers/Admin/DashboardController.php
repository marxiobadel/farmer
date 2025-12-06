<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Concurrency;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        [$admins_count, $customers_count, $visitors_count] = Cache::remember(
            'dashboard.stats',
            60,
            function () {
                return Concurrency::driver('sync')->run([
                    fn() => User::role(['admin', 'superadmin'])->count(),
                    fn() => User::role('customer')->count(),
                    fn() => User::role('visitor')->count(),
                ]);
            }
        );

        $usersStats = compact('admins_count', 'customers_count', 'visitors_count');

        return Inertia::render('admin/dashboard', [
            'usersStats' => fn () => $usersStats,
        ]);
    }
}
