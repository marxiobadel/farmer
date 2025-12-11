<?php

use App\Enums\CategoryType;
use App\Http\Controllers\Admin\CarrierController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ZoneController;
use App\Http\Controllers\Front\IndexController;
use App\Http\Controllers\Settings\ProfileController;
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

            Route::resource('products', ProductController::class)->except(['destroy', 'show']);
            Route::post('products/destroy', [ProductController::class, 'destroy'])->name('products.destroy');

            Route::resource('orders', OrderController::class)->except(['destroy']);
            Route::post('orders/destroy', [OrderController::class, 'destroy'])->name('orders.destroy');

            Route::post('carts/{cart}/add', [OrderController::class, 'addToCart'])->name('carts.add');
            Route::patch('carts/{cart}/items/{cartItem}', [OrderController::class, 'updateCartItem'])->name('carts.items.update');
            Route::delete('carts/{cart}/items/{cartItem}', [OrderController::class, 'removeCartItem'])->name('carts.items.remove');

            Route::resource('testimonials', TestimonialController::class)->only(['index', 'store', 'update']);
            Route::post('testimonials/destroy', [TestimonialController::class, 'destroy'])->name('testimonials.destroy');

            Route::resource('zones', ZoneController::class)->only(['index', 'store', 'update']);
            Route::post('zones/destroy', [ZoneController::class, 'destroy'])->name('zones.destroy');

            Route::resource('carriers', CarrierController::class)->except(['destroy', 'show']);
            Route::post('carriers/destroy', [CarrierController::class, 'destroy'])->name('carriers.destroy');

            Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
            Route::post('contacts/destroy', [ContactController::class, 'destroy'])->name('contacts.destroy');

            Route::resource('faqs', FaqController::class)->except(['show', 'edit', 'destroy']);
            Route::post('faqs/destroy', [FaqController::class, 'destroy'])->name('faqs.destroy');

            Route::redirect('/settings', '/admin/settings/general', 301);
            Route::prefix('settings')->name('settings.')
                ->whereIn('page', config('services.settings_routes'))
                ->controller(ProfileController::class)
                ->group(function () {
                    Route::get('{page}', 'settings')->name('page');
                    Route::post('{page}', 'update')->name('update');
                });
        });
    });
});

require __DIR__ . '/settings.php';
