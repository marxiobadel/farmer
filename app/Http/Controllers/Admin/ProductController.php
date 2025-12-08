<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Attribute;
use App\Models\AttributeOption;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Product::with(['variants']);

        if ($request->filled('search')) {
            $query->whereAny(['name', 'short_description', 'description'], 'like', '%' . $request->string('search') . '%');
        }

        $allowed = ['name', 'created_at', 'updated_at'];
        if ($request->filled('sort')) {
            $sort = $request->string('sort');
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            if (in_array($column, $allowed)) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->integer('per_page', 10);
        $products = $query->paginate($perPage)->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => ProductResource::collection($products)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function create()
    {
        $categories = Cache::rememberForever(
            'products_categories_oldest',
            fn() => Category::forProduct()->oldest('name')->get()
        );

        return Inertia::render('admin/products/create', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function edit(Product $product)
    {
        $categories = Cache::rememberForever(
            'products_categories_oldest',
            fn() => Category::forProduct()->oldest('name')->get()
        );

        return Inertia::render('admin/products/edit', [
            'product' => new ProductResource($product->load(['variants', 'attributes.options', 'categories'])),
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function store(ProductRequest $request)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            $product = Product::create([
                'name' => $data['name'],
                'base_price' => $data['price'] ?? 0,
                'quantity' => $data['quantity'] ?? 0,
                'short_description' => $data['meta_description'] ?? null,
                'description' => $data['description'] ?? null,
                'weight' => $data['weight'] ?? null,
                'height' => $data['height'] ?? null,
                'width' => $data['width'] ?? null,
                'length' => $data['length'] ?? null,
                'status' => $data['status'],
            ]);

            $product->categories()->sync($data['category_ids'] ?? []);
            $product->syncTags($data['tags'] ?? []);

            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $file) {
                    $media = $product->addMedia($file)->toMediaCollection('images');

                    if (isset($data['default_image']) && (int) $data['default_image'] === $index) {
                        $product->update(['default_image_id' => $media->id]);
                    }
                }
            }

            $attributeMap = [];
            $optionMap = [];

            if (!empty($data['attributes'])) {
                foreach ($data['attributes'] as $attributeData) {
                    $attribute = Attribute::create([
                        'name' => $attributeData['name'],
                        'type' => 'radio'
                    ]);

                    $product->attributes()->syncWithoutDetaching([$attribute->id]);
                    $attributeMap[$attributeData['name']] = $attribute->id;

                    foreach ($attributeData['options'] as $optionData) {
                        $option = AttributeOption::create([
                            'attribute_id' => $attribute->id,
                            'name' => $optionData['name'],
                        ]);

                        $optionMap[$attribute->id][$optionData['name']] = $option->id;
                    }
                }
            }

            if (!empty($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variant = $product->variants()->create([
                        'sku' => uniqid('SKU-'),
                        'price' => $variantData['price'],
                        'quantity' => $variantData['quantity'],
                        'is_default' => !!$variantData['is_default'],
                    ]);

                    if (!empty($variantData['image'])) {
                        $variant->addMedia($variantData['image'])->toMediaCollection('image');
                    }

                    $parts = explode(" / ", $variantData['name']);
                    $attrIndex = 0;

                    foreach ($data['attributes'] as $attr) {
                        $attrId = $attributeMap[$attr['name']];
                        $optionName = $parts[$attrIndex];
                        $optionId = $optionMap[$attrId][$optionName];

                        $variant->options()->create([
                            'attribute_id' => $attrId,
                            'attribute_option_id' => $optionId,
                        ]);

                        $attrIndex++;
                    }
                }

                $product->update(['quantity' => $product->variants()->sum('quantity')]);
            }

            DB::commit();

            return to_route('admin.products.index');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function update(ProductRequest $request, Product $product)
    {
        DB::beginTransaction();

        try {
            $data = $request->validated();

            $product->update([
                'name' => $data['name'],
                'base_price' => $data['price'] ?? 0,
                'quantity' => $data['quantity'] ?? 0,
                'short_description' => $data['meta_description'] ?? null,
                'description' => $data['description'] ?? null,
                'weight' => $data['weight'] ?? null,
                'height' => $data['height'] ?? null,
                'width' => $data['width'] ?? null,
                'length' => $data['length'] ?? null,
                'status' => $data['status'],
            ]);

            $product->categories()->sync($data['category_ids'] ?? []);
            $product->syncTags($data['tags'] ?? []);

            if ($request->has('image_ids')) {
                $imageIds = $request->input('image_ids', []);
                $product->media()
                    ->where('collection_name', 'images')
                    ->whereNotIn('id', $imageIds)
                    ->get()
                    ->each
                    ->delete();
            }

            if (!empty($data['images'])) {
                foreach ($data['images'] as $index => $file) {
                    $media = $product->addMedia($file)->toMediaCollection('images');

                    if (isset($data['default_image']) && (int) $data['default_image'] === $index) {
                        $product->update(['default_image_id' => $media->id]);
                    }
                }
            }

            if (isset($data['default_image']) && is_numeric($data['default_image'])) {
                $product->update(['default_image_id' => $data['default_image']]);
            }

            $attributes = $product->attributes;

            $product->attributes()->detach();

            AttributeOption::whereIn('attribute_id', $attributes->pluck('id'))->delete();

            Attribute::whereIn('id', $attributes->pluck('id'))->delete();

            foreach ($product->variants as $variant) {
                $variant->clearMediaCollection('image');
                $variant->options()->delete();
            }

            $product->variants()->delete();

            $attributeMap = [];
            $optionMap = [];

            if (!empty($data['attributes'])) {
                foreach ($data['attributes'] as $attributeData) {

                    $attribute = Attribute::create([
                        'name' => $attributeData['name'],
                        'type' => 'radio',
                    ]);

                    $product->attributes()->attach($attribute->id);
                    $attributeMap[$attributeData['name']] = $attribute->id;

                    foreach ($attributeData['options'] as $optionData) {
                        $option = AttributeOption::create([
                            'attribute_id' => $attribute->id,
                            'name' => $optionData['name'],
                        ]);

                        $optionMap[$attribute->id][$optionData['name']] = $option->id;
                    }
                }
            }

            if (!empty($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variant = $product->variants()->create([
                        'sku' => uniqid('SKU-'),
                        'price' => $variantData['price'],
                        'quantity' => $variantData['quantity'],
                        'is_default' => !!$variantData['is_default'],
                    ]);

                    if ($variantData['image'] instanceof UploadedFile) {
                        $variant->addMedia($variantData['image'])->toMediaCollection('image');
                    } elseif (is_string($variantData['image'])) {
                        $variant->addMediaFromUrl($variantData['image'])->toMediaCollection('image');
                    }

                    // assign options to variant
                    $parts = explode(" / ", $variantData['name']);
                    $attrIndex = 0;

                    foreach ($data['attributes'] as $attr) {
                        $attrId = $attributeMap[$attr['name']];
                        $optionName = $parts[$attrIndex];
                        $optionId = $optionMap[$attrId][$optionName];

                        $variant->options()->create([
                            'attribute_id' => $attrId,
                            'attribute_option_id' => $optionId,
                        ]);

                        $attrIndex++;
                    }
                }

                $product->update([
                    'quantity' => $product->variants()->sum('quantity')
                ]);
            }

            DB::commit();

            return to_route('admin.products.index');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:products,id',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $ids = $request->input('ids');

                // Récupérer tous les produits à supprimer
                $products = Product::whereIn('id', $ids)->get();

                foreach ($products as $product) {
                    $product->tags()->delete();
                    $product->delete();
                }
            });

            return redirect()->back()->with('success', 'Produit(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur lors de la suppression : ' . $e->getMessage());
        }
    }
}
