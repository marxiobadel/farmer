<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Cart::with(['user', 'items.product', 'items.variant']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $searchColumns = ['firstname', 'lastname', 'email'];
                $q->where('id', '=', $search)
                    ->orWhereHas('user', fn($u) => $u->whereAny($searchColumns, 'like', "%$search%"))
                    ->orWhere('status', 'like', "%$search%");
            });
        }

        $query->orderBy('created_at', 'desc');

        $perPage = $request->integer('per_page', 10);
        $carts = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/carts/index', [
            'carts' => CartResource::collection($carts)->response()->getData(true),
            'filters' => $request->only(['search', 'sort', 'per_page']),
        ]);
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Cart::destroy($ids);
            }

            return redirect()->back()->with('success', 'Panier(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : ' . $e->getMessage());
        }
    }
}
