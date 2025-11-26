<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Front\IndexController;
use Illuminate\Support\Facades\Route;

Route::get('/', [IndexController::class, 'home'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
});

require __DIR__.'/settings.php';
