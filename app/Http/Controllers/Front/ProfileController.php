<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\User;
use App\Settings\GeneralSettings;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

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
            ->paginate($request->input('per_page', 10))
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

    public function downloadInvoice(GeneralSettings $settings, Order $order)
    {
        $order->load(['user', 'items.product', 'items.variant', 'carrier']);

        $data = [
            'order' => $order,
            'company' => [
                'name' => config('app.name'),
                'address' => $settings->address,
                'phone' => $settings->phone,
                'email' => $settings->email,
                'logo' => public_path('images/logo_with_bg.png'),
            ],
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data);

        return $pdf->download('facture-'.$order->id.'.pdf');
    }

    public function edit(Request $request)
    {
        return Inertia::render('front/profile/edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'lastname' => 'required|string|max:255',
            'firstname' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($request->user()->id),
            ],
            'phone' => 'nullable|string|max:255',
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $request->user()->fill($validated);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        if ($request->hasFile('image')) {
            $request->user()->addMediaFromRequest('image')->toMediaCollection('profile');
        }

        return back()->with('status', 'profile-updated');
    }

    public function addresses(Request $request)
    {
        return Inertia::render('front/profile/addresses', [
            'addresses' => AddressResource::collection($request->user()->addresses),
        ]);
    }

    public function security(Request $request)
    {
        return Inertia::render('front/profile/password', [
            'status' => session('status'),
        ]);
    }
}
