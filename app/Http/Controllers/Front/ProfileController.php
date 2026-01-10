<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $recentOrders = $user->orders()
            ->with(['items.product', 'carrier'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('front/profile/index', [
            'recentOrders' => OrderResource::collection($recentOrders),
            'stats' => [
                'orders_count' => $user->orders()->count(),
                'total_spent' => $user->orders()->where('status', '=', 'completed')->sum('total'),
            ]
        ]);
    }

    public function orders(Request $request)
    {
        $orders = Auth::user()->orders()
            ->with(['items.product', 'carrier', 'payments'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('front/profile/orders', [
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function showOrder(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403, 'Vous n\'êtes pas autorisé à voir cette commande.');

        return Inertia::render('front/profile/order-show', [
            'order' => new OrderResource($order->load(['user', 'carrier', 'items.product', 'items.variant'])),
        ]);
    }

    public function edit(Request $request)
    {
        return Inertia::render('front/profile/edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function addresses(Request $request)
    {
        return Inertia::render('front/profile/addresses', [
            'addresses' => AddressResource::collection($request->user()->addresses),
        ]);
    }
}
