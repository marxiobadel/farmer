<?php

namespace App\Http\Controllers\Front;

use App\Mail\WelcomeDiscountMail;
use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Http\Resources\HomeCategoryResource;
use App\Http\Resources\TestimonialResource;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Faq;
use App\Models\Testimonial;
use App\Models\User;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class IndexController extends Controller
{
    public function home(Request $request)
    {
        $categories = Cache::remember(
            'front_products_categories_oldest',
            60 * 60 * 24,
            fn() => Category::forProduct()
                ->active()
                ->orderByDesc('position')
                ->get()
                ->map(function (Category $category) {
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

    public function sendDiscountLead(Request $request, WhatsAppService $whatsAppService)
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:100'],
            'lastname' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'code' => ['nullable', 'string', 'max:50'],
            'coupon_id' => ['nullable', 'exists:coupons,id'],
        ]);

        $email = strtolower(trim($validated['email']));

        $user = DB::transaction(function () use ($validated, $email) {
            $existingUser = User::where('email', $email)->first();

            if ($existingUser) {
                // 1. Client existant : NE JAMAIS toucher à son mot de passe ni écraser ses données
                // On enrichit uniquement le numéro de téléphone s'il n'en avait pas renseigné
                if (empty($existingUser->phone) && !empty($validated['phone'])) {
                    $existingUser->update([
                        'phone' => $validated['phone'],
                    ]);
                }

                return $existingUser;
            }

            // 2. Nouveau client : Création sécurisée du compte
            $temporaryPassword = $email;

            return User::create([
                'firstname' => trim($validated['firstname']),
                'lastname' => trim($validated['lastname']),
                'email' => $email,
                'phone' => $validated['phone'] ?? null,
                'password' => $temporaryPassword,
            ]);
        });

        // 2. Connexion immédiate de l'utilisateur et régénération de session
        Auth::login($user, remember: true);
        $request->session()->regenerate();

        // 3. Récupération des informations du coupon actif
        $coupon = null;
        if (!empty($validated['coupon_id'])) {
            $coupon = Coupon::find($validated['coupon_id']);
        } elseif (!empty($validated['code'])) {
            $coupon = Coupon::where('code', $validated['code'])->first();
        }

        $promoCode = $coupon?->code ?? ($validated['code'] ?? 'BIENVENUE10');

        $expirationDate = $coupon?->expires_at
            ? Carbon::parse($coupon->expires_at)->locale('fr')->isoFormat('D MMMM YYYY')
            : Carbon::now()->addDays(30)->locale('fr')->isoFormat('D MMMM YYYY');

        // 4. Envoi du message WhatsApp via Template officiel (si numéro fourni)
        if (!empty($validated['phone'])) {
            try {
                $whatsAppService->sendCouponTemplate(
                    to: $validated['phone'],
                    firstname: $user->firstname,
                    promoCode: $promoCode,
                    expirationDate: $expirationDate,
                    templateName: 'coupon_bienvenue',
                    languageCode: 'fr'
                );
            } catch (\Throwable $e) {
                Log::error('Échec envoi WhatsApp coupon:', [
                    'user_id' => $user->id,
                    'phone' => $validated['phone'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // 5. Envoi de l'e-mail de confirmation avec le code promo
        try {
            Mail::to($user->email)->sendNow(new WelcomeDiscountMail(
                user: $user,
                promoCode: $promoCode,
                expirationDate: $expirationDate
            ));
        } catch (\Throwable $e) {
            Log::error('Échec envoi Email coupon:', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

        // 6. Réponse
        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'user' => $user,
                'code' => $promoCode,
                'reload' => true,
            ]);
        }

        return redirect()->back()->with('success', 'Bienvenue ! Votre réduction est activée.');
    }
}
