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
use App\Models\ProductVariant;
use App\Models\StockMovement;
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
            $query->whereAny(['name', 'short_description', 'description'], 'like', '%'.$request->string('search').'%');
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
            fn () => Category::forProduct()->oldest('name')->get()
        );

        return Inertia::render('admin/products/create', [
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function edit(Product $product)
    {
        $categories = Cache::rememberForever(
            'products_categories_oldest',
            fn () => Category::forProduct()->oldest('name')->get()
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
                'quantity' => 0,
                'origin' => $data['origin'] ?? null,
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

            if (! empty($data['images'])) {
                foreach ($data['images'] as $index => $file) {
                    $media = $product->addMedia($file)->toMediaCollection('images');

                    if (isset($data['default_image']) && (int) $data['default_image'] === $index) {
                        $product->update(['default_image_id' => $media->id]);
                    }
                }
            }

            $attributeMap = [];
            $optionMap = [];

            if (! empty($data['attributes'])) {
                foreach ($data['attributes'] as $attributeData) {
                    $attribute = Attribute::create([
                        'name' => $attributeData['name'],
                        'type' => 'radio',
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

            if (! empty($data['variants'])) {
                foreach ($data['variants'] as $variantData) {
                    $variant = $product->variants()->create([
                        'sku' => uniqid('SKU-'),
                        'price' => $variantData['price'],
                        'quantity' => 0,
                        'is_default' => (bool) $variantData['is_default'],
                    ]);

                    if ($variantData['quantity'] > 0) {
                        StockMovement::create([
                            'variant_id' => $variant->id,
                            'product_id' => $product->id,
                            'user_id' => auth()->id(),
                            'quantity' => $variantData['quantity'],
                            'type' => 'initial',
                            'note' => 'Stock initial (Variante)',
                        ]);
                    }

                    if (! empty($variantData['image'])) {
                        $variant->addMedia($variantData['image'])->toMediaCollection('image');
                    }

                    $parts = explode(' / ', $variantData['name']);
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
            } else {
                $initialQty = $data['quantity'] ?? 0;

                if ($initialQty > 0) {
                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'quantity' => $initialQty,
                        'type' => 'initial',
                        'note' => 'Stock initial',
                    ]);
                }
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

            // 1. Mise à jour des informations de base du produit
            $product->update([
                'name' => $data['name'],
                'base_price' => $data['price'] ?? 0,
                'origin' => $data['origin'] ?? null,
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

            // 2. Gestion des suppressions d'images existantes
            if ($request->has('image_ids')) {
                $imageIds = $request->input('image_ids', []);
                $product->media()
                    ->where('collection_name', '=', 'images')
                    ->whereNotIn('id', $imageIds)
                    ->get()->each->delete();
            }

            // 3. Ajout des nouvelles images
            if (! empty($data['images'])) {
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

            // ---------------------------------------------------------
            // POINT 2 : SAUVEGARDE DES DONNÉES AVANT SUPPRESSION
            // ---------------------------------------------------------
            $preservedMedia = [];
            $preservedVariants = []; // Tableau pour stocker prix, qté, sku

            $product->load('variants.optionValues');

            foreach ($product->variants as $variant) {
                // Construction de la clé unique (Nom de la variante)
                $variantName = $variant->optionValues
                    ->map(fn ($opt) => $opt->name)
                    ->join(' / ');

                // A. Sauvegarde du Média (existant)
                $mediaItem = $variant->getFirstMedia('image');
                if ($mediaItem) {
                    $mediaItem->update([
                        'model_type' => 'App\Models\TempMedia',
                        'model_id' => 0,
                    ]);
                    $preservedMedia[$variantName] = $mediaItem;
                }

                // B. Sauvegarde des Données (NOUVEAU)
                $preservedVariants[$variantName] = [
                    'price' => $variant->price,
                    'quantity' => $variant->quantity,
                    'sku' => $variant->sku,
                ];
            }

            // 4. Suppression destructive (Attributs & Variantes)
            $attributes = $product->attributes;
            $product->attributes()->detach();
            AttributeOption::whereIn('attribute_id', $attributes->pluck('id'))->delete();
            Attribute::whereIn('id', $attributes->pluck('id'))->delete();

            foreach ($product->variants as $variant) {
                $variant->options()->delete();
            }
            $product->variants()->delete();

            // 5. Recréation des Attributs
            $attributeMap = [];
            $optionMap = [];

            if (! empty($data['attributes'])) {
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

            // 6. Recréation des Variantes avec RESTAURATION
            if (! empty($data['variants'])) {
                foreach ($data['variants'] as $variantData) {

                    // Initialisation des valeurs par défaut venant du formulaire
                    $price = $variantData['price'];
                    $quantity = (int) $variantData['quantity'];
                    $sku = uniqid('SKU-');
                    $variantName = $variantData['name'];

                    // TENTATIVE DE RESTAURATION
                    if (isset($preservedVariants[$variantName])) {
                        $oldData = $preservedVariants[$variantName];

                        // Restauration du SKU pour garder la traçabilité si possible
                        $sku = $oldData['sku'];

                        // Si le frontend renvoie 0 (bug potentiel ou champ vide) alors qu'on avait du stock, on restaure
                        // Note: Vous pouvez ajuster cette condition selon si vous voulez forcer la restauration ou non
                        if ($quantity === 0 && $oldData['quantity'] > 0) {
                            $quantity = $oldData['quantity'];
                        }

                        // Optionnel : Restauration du prix si 0 ou vide
                        if ((float)$price === 0.0 && (float)$oldData['price'] > 0.0) {
                            $price = $oldData['price'];
                        }
                    }

                    $variant = $product->variants()->create([
                        'sku' => $sku,
                        'price' => $price,
                        'quantity' => 0, // On initialise à 0 pour gérer le mouvement de stock juste après
                        'is_default' => (bool) $variantData['is_default'],
                    ]);

                    // Gestion des Images (inchangée)
                    if (isset($variantData['image']) && $variantData['image'] instanceof UploadedFile) {
                        $variant->addMedia($variantData['image'])->toMediaCollection('image');
                    } elseif (isset($preservedMedia[$variantName])) {
                        $oldMedia = $preservedMedia[$variantName];
                        $oldMedia->update([
                            'model_type' => ProductVariant::class,
                            'model_id' => $variant->id,
                        ]);
                    }

                    // Liaison des Options
                    $parts = explode(' / ', $variantName);
                    $attrIndex = 0;
                    foreach ($data['attributes'] as $attr) {
                        if (! isset($attributeMap[$attr['name']])) continue;

                        $attrId = $attributeMap[$attr['name']];
                        $optionName = $parts[$attrIndex] ?? '';

                        if (isset($optionMap[$attrId][$optionName])) {
                            $optionId = $optionMap[$attrId][$optionName];
                            $variant->options()->create([
                                'attribute_id' => $attrId,
                                'attribute_option_id' => $optionId,
                            ]);
                        }
                        $attrIndex++;
                    }

                    // Gestion des Mouvements de Stock
                    // On compare la quantité cible ($quantity restaurée ou saisie) avec 0 (nouveau record)
                    if ($quantity > 0) {
                        // Pour éviter de fausser l'historique (créer un mouvement "+10" alors que le stock existait déjà),
                        // on pourrait vérifier si c'est une restauration.
                        // Mais pour simplifier et assurer la cohérence du champ 'quantity' final :

                        // 1. On met à jour la quantité réelle sur le modèle
                        $variant->update(['quantity' => $quantity]);

                        // 2. On crée un log.
                        // Si c'est une restauration exacte, techniquement ce n'est pas un mouvement physique,
                        // mais comme on a supprimé l'ancien record, c'est une "Correction administrative".
                        StockMovement::create([
                            'variant_id' => $variant->id,
                            'product_id' => $product->id,
                            'user_id' => auth()->id(),
                            'quantity' => $quantity,
                            'type' => 'adjustment', // ou 'restoration' si vous créez ce type
                            'note' => isset($preservedVariants[$variantName])
                                ? 'Restauration suite mise à jour produit'
                                : 'Stock initial (Mise à jour)',
                        ]);
                    }
                }
                $product->update(['quantity' => $product->variants()->sum('quantity')]);
            } else {
                // Logique pour produit sans variante (inchangée)
                $currentQty = $product->quantity;
                $targetQty = (int) ($data['quantity'] ?? 0);
                $diff = $targetQty - $currentQty;

                if ($diff !== 0) {
                    $product->update(['quantity' => $targetQty]); // Mise à jour explicite nécessaire ici aussi
                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'quantity' => $diff,
                        'type' => 'adjustment',
                        'note' => 'Mise à jour manuelle fiche produit',
                    ]);
                }
            }

            // Nettoyage des médias orphelins
            if (! empty($preservedMedia)) {
                foreach ($preservedMedia as $media) {
                    if ($media->fresh()->model_id === 0) {
                        $media->delete();
                    }
                }
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
                $products = Product::with('variants')->whereIn('id', $request->input('ids'))->get();

                foreach ($products as $product) {

                    // GESTION DU STOCK (Traçabilité avant suppression)
                    // On enregistre une "Perte/Destruction" pour justifier la disparition du stock

                    // A. Pour le produit simple
                    if ($product->quantity > 0) {
                        StockMovement::create([
                            'product_id' => $product->id,
                            'user_id' => auth()->id(),
                            'quantity' => -($product->quantity), // On vide le stock
                            'type' => 'destruction', // Nouveau type à prévoir
                            'note' => 'Suppression définitive du produit',
                        ]);
                    }

                    // B. Pour les variantes (si elles existent)
                    foreach ($product->variants as $variant) {
                        if ($variant->quantity > 0) {
                            StockMovement::create([
                                'variant_id' => $variant->id,
                                'product_id' => $product->id,
                                'user_id' => auth()->id(),
                                'quantity' => -($variant->quantity),
                                'type' => 'destruction',
                                'note' => 'Suppression définitive du produit (Variante)',
                            ]);
                        }
                    }

                    $product->tags()->detach();

                    $product->delete();
                }
            });

            return redirect()->back()->with('success', 'Produit(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur lors de la suppression : '.$e->getMessage());
        }
    }
}
