<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TestimonialRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\TestimonialResource;
use App\Http\Resources\UserResource;
use App\Models\Product;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Concurrency;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Testimonial::query();

        if ($request->filled('search')) {
            $searchColumns = ['message'];
            $query->whereAny($searchColumns, 'like', '%'.$request->string('search').'%');
        }

        $allowed = ['message', 'created_at', 'updated_at'];
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
        $testimonials = $query->paginate($perPage)->withQueryString();

        [$users, $products] = Concurrency::driver('sync')->run([
            fn () => Cache::rememberForever('users_oldest', fn () => User::oldest('lastname')->get()),
            fn () => Cache::rememberForever('products_oldest', fn () => Product::oldest('name')->get()),
        ]);

        return Inertia::render('admin/testimonials/index', [
            'users' => UserResource::collection($users),
            'products' => ProductResource::collection($products),
            'testimonials' => TestimonialResource::collection($testimonials)->response()->getData(true),
            'filters' => $request->only(['search', 'status', 'sort', 'per_page']),
        ]);
    }

    public function store(TestimonialRequest $request)
    {
        Testimonial::create($request->validated());

        return back()->with('success', 'Témoignage ajouté avec succès !');
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial)
    {
        $testimonial->update($request->validated());

        return redirect()->back()->with('success', 'Témoignage mis à jour avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                if (! empty($ids)) {
                    Testimonial::destroy($ids);
                }
            }

            return redirect()->back()->with('success', 'Témoignage(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
