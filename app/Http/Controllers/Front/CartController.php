<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService)
    {
    }

    public function index()
    {
        $products = Product::with('variants.options')->latest()->get();

        return view('front.carts.index', [
            'products' => ProductResource::collection($products),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $this->cartService->addProduct(
            $request->input('product_id'),
            $request->input('variant_id'),
            $request->input('quantity')
        );

        return back()->with('success', 'Produit ajouté au panier');
    }
}
