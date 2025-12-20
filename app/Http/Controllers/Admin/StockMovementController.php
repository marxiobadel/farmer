<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StockMovementResource;
use App\Models\Product;
use App\Models\StockMovement; // We will create this below
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1'],
            'search' => ['nullable', 'string'],
            'type' => ['nullable', 'string'], // e.g., 'sale', 'restock', 'correction'
            'sort' => ['nullable', 'string'],
            'product_id' => ['nullable', 'integer'], // Useful to filter history of specific product
        ]);

        // Eager load Product, Variant, User, and the Polymorphic Reference (Order, etc.)
        $query = StockMovement::with(['product', 'variant', 'user', 'reference']);

        // 1. Search Logic
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('note', 'like', "%$search%") // Search in notes
                    ->orWhere('id', $search)
                    // Search by Product Name
                    ->orWhereHas('product', fn ($p) => $p->where('name', 'like', "%$search%"))
                    // Search by Variant SKU
                    ->orWhereHas('variant', fn ($v) => $v->where('sku', 'like', "%$search%"))
                    // Search by User Name
                    ->orWhereHas('user', fn ($u) => $u->where('firstname', 'like', "%$search%")
                        ->orWhere('lastname', 'like', "%$search%"));
            });
        }

        // 2. Filter by Type (Sale, Restock, etc.)
        if ($request->filled('type')) {
            $query->where('type', '=', $request->string('type'));
        }

        // 3. Filter by Specific Product (Optional but recommended for inventory)
        if ($request->filled('product_id')) {
            $query->where('product_id', '=', $request->integer('product_id'));
        }

        // 4. Sorting
        $allowed = ['quantity', 'stock_before', 'stock_after', 'created_at', 'type'];
        if ($request->filled('sort')) {
            $sort = $request->string('sort');
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');

            if (in_array($column, $allowed)) {
                $query->orderBy($column, $direction);
            }
        } else {
            // Default sort: Newest first
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->integer('per_page', 10);
        $movements = $query->paginate($perPage)->withQueryString();

        $products = Product::with('variants.options')->latest()->get();

        return Inertia::render('admin/inventory/movements', [
            'movements' => StockMovementResource::collection($movements)->response()->getData(true),
            'filters' => $request->only(['search', 'type', 'sort', 'per_page', 'product_id']),
            'products' => ProductResource::collection($products),
            'types' => ['sale', 'restock', 'correction', 'return', 'initial', 'destruction'],
        ]);
    }

    public function show(StockMovement $stockMovement)
    {
        $stockMovement->load(['product', 'variant', 'user', 'reference']);

        return Inertia::render('admin/inventory/show', [
            'movement' => new StockMovementResource($stockMovement),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', 'string', 'in:correction,restock,return,destruction,adjustment,sale,initial'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        StockMovement::create([
            'product_id' => $validated['product_id'],
            'variant_id' => $validated['variant_id'] ?? null,
            'user_id' => auth()->id(),
            'quantity' => $validated['quantity'],
            'type' => $validated['type'],
            'note' => $validated['note'] ?? 'Ajustement manuel',
            'reference_type' => null,
            'reference_id' => null,
        ]);

        return back()->with('success', 'Stock ajusté avec succès.');
    }
}
