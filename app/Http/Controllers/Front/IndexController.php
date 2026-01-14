<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Http\Resources\HomeCategoryResource;
use App\Http\Resources\TestimonialResource;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class IndexController extends Controller
{
    public function home(Request $request)
    {
        $categories = Cache::remember(
            'front_products_categories_oldest',
            60 * 60 * 24,
            fn() =>
            Category::forProduct()
                ->active()
                ->orderBy('name')
                ->get()
                ->map(function ($category) {
                    // On charge les produits seulement si le cache est vide
                    $products = $category->products()
                        ->published()
                        ->with(['variants.options'])
                        ->latest()
                        ->take(8)
                        ->get();

                    $category->setRelation('products', $products);

                    return $category;
                })
        );

        $testimonials = Cache::remember(
            'front_testimonials_active',
            60 * 60 * 24,
            fn() => Testimonial::with('user')->approved()->inRandomOrder()->take(3)->get()
        );

        return Inertia::render('front/index', [
            'canRegister' => Features::enabled(Features::registration()),
            'categories' => HomeCategoryResource::collection($categories),
            'testimonials' => TestimonialResource::collection($testimonials),
        ]);
    }

    public function privacy(Request $request)
    {
        return Inertia::render('front/privacy');
    }

    public function legal(Request $request)
    {
        return Inertia::render('front/legal');
    }

    public function cgv(Request $request)
    {
        return Inertia::render('front/cgv');
    }

    public function about(Request $request)
    {
        return Inertia::render('front/about');
    }

    public function faqs(Request $request)
    {
        $faqs = Faq::active()->latest()->paginate(10);

        return Inertia::render('front/faqs', [
            'faqs' => Inertia::scroll(FaqResource::collection($faqs)),
        ]);
    }

    public function farming(Request $request)
    {
        return Inertia::render('front/farming');
    }
}
