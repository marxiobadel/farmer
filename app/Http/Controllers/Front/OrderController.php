<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Http\Resources\CountryResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ZoneResource;
use App\Models\Country;
use App\Models\Order;
use App\Models\Product;
use App\Models\Zone;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class OrderController extends Controller
{
    public function __construct(protected CartService $cartService)
    {}

    public function create()
    {
        $currentUser = Auth::user();

        $addresses = $currentUser ? $currentUser->addresses()->get() : [];
        $zones = Zone::with('rates.carrier')->get();
        $products = Product::with('variants.options')->latest()->get();

        $countries = Cache::rememberForever('countries', function () {
            return Country::orderBy('name')->get(['id', 'iso', 'nicename', 'name', 'phonecode']);
        });

        return inertia('front/orders/create', [
            'user_addresses' => AddressResource::collection($addresses),
            'zones' => ZoneResource::collection($zones),
            'countries' => CountryResource::collection($countries),
            'products' => ProductResource::collection($products),
        ]);
    }

    public function store(Request $request)
    {
        // Logique de création de commande (omise pour la simplicité)
    }

    public function success(Order $order)
    {
        if (Auth::check() && $order->user_id !== Auth::id()) {
            abort(403);
        }

        return inertia('front/orders/success', [
            'order' => new OrderResource($order->load(['user', 'carrier', 'items.product', 'items.variant'])),
        ]);
    }
}
