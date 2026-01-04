<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::published()->with(['categories', 'variants']);

        if ($request->filled('search')) {
            $query->whereAny(['name', 'short_description', 'description'], 'like', '%' . $request->string('search') . '%');
        }

        if ($request->filled('category')) {
            $query->whereRelation('categories', 'slug', '=', $request->string('category'));
        }

        if ($request->filled('min_price')) {
            $query->where('base_price', '>=', $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('base_price', '<=', $request->input('max_price'));
        }

        // On récupère le prix du variant par défaut (ou le premier) via une sous-requête
        $variantPriceSubquery = "(
            SELECT price FROM product_variants
            WHERE product_variants.product_id = products.id
            ORDER BY is_default DESC, id ASC
            LIMIT 1
        )";

        // COALESCE renvoie la première valeur non-nulle.
        // Si le produit a des variants, $variantPriceSubquery renvoie un prix, on l'utilise.
        // Sinon, il renvoie NULL, et on utilise products.base_price.
        $effectivePriceSql = "COALESCE($variantPriceSubquery, products.base_price)";

        switch ($request->input('sort')) {
            case 'price_asc':
                $query->orderByRaw("$effectivePriceSql ASC");
                break;
            case 'price_desc':
                $query->orderByRaw("$effectivePriceSql DESC");
                break;
            case 'oldest':
                $query->oldest();
                break;
            default: // 'newest' par défaut
                $query->latest();
                break;
        }

        $products = $query->latest()->paginate(10);

        $categories = Category::active()->forProduct()->orderBy('name')->get();

        // Stats pour le slider prix (basé sur le base_price pour la performance globale)
        $priceStats = Product::published()
            ->selectRaw('min(base_price) as min, max(base_price) as max')
            ->first();

        return Inertia::render('front/products/index', [
            'products' => Inertia::scroll(ProductResource::collection($products)),
            'categories' => CategoryResource::collection($categories),
            'filters' => $request->all(),
            'priceRange' => [
                'min' => $priceStats->min ?? 0,
                'max' => $priceStats->max ?? 10000,
            ],
        ]);
    }

    public function show(Request $request, Product $product)
    {
        $user = auth()->user();

        $product->load(['attributes.options', 'categories', 'variants.options']);

        return Inertia::render('front/products/show', [
            'product' => fn() => new ProductResource($product),
            'related' => fn() => Product::where('id', '!=', $product->id)
                ->published()
                ->with(['variants.options', 'categories'])
                ->whereHas('categories', function ($q) use ($product) {
                    $q->whereIn('id', $product->categories->pluck('id'));
                })
                ->limit(4)
                ->get(),
            'isFavorited' => $user ? $user->hasFavorited($product) : false,
        ]);
    }

    public function toggle(Product $product)
    {
        $user = auth()->user();

        if (!$user) {
            return back()->with('message', 'Unauthenticated.');
        }

        $user->toggleFavorite($product);

        return back()->with('favorited', $user->hasFavorited($product));
    }
}
