<?php

use App\Enums\CategoryType;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Front\IndexController;
use Illuminate\Support\Facades\Route;

Route::get('/', [IndexController::class, 'home'])->name('home');

Route::middleware(['auth'])->group(function () {
    Route::prefix('admin')->middleware(['can:access-admin'])->group(function () {
        Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

        Route::name('admin.')->group(function () {
            Route::middleware('role:superadmin')->group(function () {
                Route::resource('users', UserController::class)->except(['destroy', 'show']);
                Route::post('users/destroy', [UserController::class, 'destroy'])->name('users.destroy');
            });

            Route::prefix('{type}')->whereIn('type', CategoryType::values())->group(function () {
                Route::resource('categories', CategoryController::class)
                    ->parameters(['' => 'category'])
                    ->only(['index', 'store', 'update']);
                Route::post('categories/destroy', [CategoryController::class, 'destroy'])->name('categories.destroy');
            });

            Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
            Route::post('contacts/destroy', [ContactController::class, 'destroy'])->name('contacts.destroy');

            Route::resource('faqs', FaqController::class)->except(['show', 'edit', 'destroy']);
            Route::post('faqs/destroy', [FaqController::class, 'destroy'])->name('faqs.destroy');
        });
    });
});

require __DIR__ . '/settings.php';
