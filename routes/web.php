<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Front\IndexController;
use Illuminate\Support\Facades\Route;

Route::get('/', [IndexController::class, 'home'])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::prefix('admin')->middleware(['can:access-admin'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

        Route::middleware('role:superadmin')->group(function () {
            Route::resource('users', UserController::class)->except(['destroy', 'show']);
            Route::post('users/destroy', [UserController::class, 'destroy'])->name('users.destroy');
        });
    });
});

require __DIR__.'/settings.php';
