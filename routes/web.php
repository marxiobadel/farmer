<?php

use App\Enums\CategoryType;
use App\Http\Controllers\Admin\CarrierController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\StockMovementController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ZoneController;
use App\Http\Controllers\Front\IndexController;
use App\Http\Controllers\Front\NewsletterController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('migrate', function () {
    Artisan::call('migrate');
    dd('migrated!');
});

Route::get('storage/link', function () {
    Artisan::call('storage:link');
    dd('storage linked!');
});

Route::get('/', [IndexController::class, 'home'])->name('home');
foreach (config('services.frontend_routes') as $route) {
    Route::get($route['uri'], [IndexController::class, $route['action']])->name($route['name']);
}

Route::prefix('contact')
    ->controller(\App\Http\Controllers\Front\ContactController::class)
    ->group(function () {
        Route::get('/', 'index')->name('contact');
        Route::post('/', 'store')->name('contact.store');
    });

Route::post('newsletters', [NewsletterController::class, 'store'])->name('newsletter.store');

Route::get('products/search', [\App\Http\Controllers\Front\ProductController::class, 'search'])->name('products.search');
Route::resource('products', \App\Http\Controllers\Front\ProductController::class)->only(['index', 'show']);
Route::post('products/{product}/favorite', [\App\Http\Controllers\Front\ProductController::class, 'toggle'])->name('products.favorite');

Route::prefix('carts')->name('carts.')
    ->controller(\App\Http\Controllers\Front\CartController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('add', 'store')->name('store');
        Route::patch('items/{cartItem}', 'update')->name('items.update');
        Route::delete('items/{cartItem}', 'destroy')->name('items.destroy');
    });

Route::middleware(['auth'])->group(function () {
    Route::prefix('espace-pro')->name('pro.')
        ->controller(\App\Http\Controllers\Front\ProController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
        });

    Route::prefix('profile')->name('profile.')
        ->controller(\App\Http\Controllers\Front\ProfileController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
        });

    Route::prefix('admin')->middleware(['can:access-admin'])->group(function () {
        Route::redirect('/', '/admin/dashboard', 301);

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

            Route::prefix('inventory')->name('inventory.')->group(function () {
                Route::get('movements', [StockMovementController::class, 'index'])->name('index');
                Route::post('adjust', [StockMovementController::class, 'store'])->name('store');
                Route::get('{stockMovement}', [StockMovementController::class, 'show'])->name('show');
            });

            Route::resource('orders', OrderController::class)->except(['destroy']);
            Route::post('orders/destroy', [OrderController::class, 'destroy'])->name('orders.destroy');
            Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
            Route::get('orders/{order}/invoice', [OrderController::class, 'downloadInvoice'])->name('orders.invoice');

            Route::patch('payments/{payment}/status', [PaymentController::class, 'updateStatus'])->name('payments.update-status');

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
