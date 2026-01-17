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
            $query->whereAny(['name', 'short_description', 'description'], 'like', '%'.$request->string('search').'%');
        }

        if ($request->filled('category')) {
            $query->whereRelation('categories', 'slug', '=', $request->string('category'));
        }

        // On récupère le prix du variant par défaut (ou le premier) via une sous-requête
        // Utile uniquement pour le tri (sort)
        $variantPriceSubquery = '(
            SELECT price FROM product_variants
            WHERE product_variants.product_id = products.id
            ORDER BY is_default DESC, id ASC
            LIMIT 1
        )';

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
            default:
                $query->latest();
                break;
        }

        $products = $query->latest()->paginate(10);

        $categories = Category::active()->forProduct()->orderBy('name')->get();

        return Inertia::render('front/products/index', [
            'products' => fn () => ProductResource::collection($products),
            'categories' => fn () => CategoryResource::collection($categories),
            'filters' => $request->all(),
        ]);
    }

    public function show(Request $request, Product $product)
    {
        $user = auth()->user();

        $product->load(['attributes.options', 'categories', 'variants.options']);

        $related = Product::where('id', '!=', $product->id)
            ->published()
            ->with(['variants.options', 'categories'])
            ->whereHas('categories', function ($q) use ($product) {
                $q->whereIn('id', $product->categories->pluck('id'));
            })
            ->limit(4)
            ->get();

        return Inertia::render('front/products/show', [
            'product' => fn () => new ProductResource($product),
            'related' => fn () => ProductResource::collection($related),
            'isFavorited' => $user ? $user->hasFavorited($product) : false,
        ]);
    }

    public function toggle(Product $product)
    {
        $user = auth()->user();

        if (! $user) {
            return back()->with('message', 'Unauthenticated.');
        }

        $user->toggleFavorite($product);

        return back()->with('favorited', $user->hasFavorited($product));
    }

    public function search(Request $request)
    {
        $query = Product::published()->with(['categories', 'variants.options']);

        if ($request->filled('q')) {
            $query->whereAny(['name', 'short_description', 'description'], 'like', '%'.$request->string('q').'%');
        }

        $products = $query->oldest('name')->take(5)->get();

        return response()->json([
            'results' => ProductResource::collection($products),
        ]);
    }
}
