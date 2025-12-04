<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request, string $type)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Category::query()->where('type', '=', $type);

        if ($request->filled('search')) {
            $query->whereAny(['name'], 'like', '%'.$request->string('search').'%');
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
        $categories = $query->paginate($perPage)->withQueryString();

        $listCategories = Category::where('type', '=', $type)->get();

        return Inertia::render("admin/{$type}/categories/index", [
            'categories' => CategoryResource::collection($categories)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
            'listCategories' => CategoryResource::collection($listCategories),
        ]);
    }

    public function store(CategoryRequest $request, string $type)
    {
        try {
            $validated = [...$request->validated(), 'type' => $type];
            $category = Category::create($validated);

            if ($request->hasFile('image')) {
                $category->addMediaFromRequest('image')->toMediaCollection('cover');
            }

            return redirect()->back()->with('success', 'Catégorie créée avec succès.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Erreur lors de la création : '.$e->getMessage());
        }
    }

    public function update(CategoryRequest $request, string $type, Category $category)
    {
        try {
            $validated = $request->safe()->all();

            $category->update($validated);

            if ($request->hasFile('image')) {
                $category->addMediaFromRequest('image')->toMediaCollection('cover');
            }

            return redirect()->back()->with('success', 'Catégorie mise à jour avec succès.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Erreur lors de la mise à jour : '.$e->getMessage());
        }
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Category::destroy($ids);
            }

            return redirect()->back()->with('success', 'Catégorie(s) supprimée(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
