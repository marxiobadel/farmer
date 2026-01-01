<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {

    }

    public function show(Request $request, Product $product)
    {
        return Inertia::render('front/products/show', [
            'product' => new ProductResource($product)
        ]);
    }
}
