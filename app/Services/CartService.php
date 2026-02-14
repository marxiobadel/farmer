<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService
{
    protected Cart $cart;

    protected string $cookieName = 'cart_guest_id';

    public function __construct()
    {
        $this->cart = $this->resolveCart();
    }

    /**
     * Appliquer un coupon au panier
     */
    public function applyCoupon(string $code): void
    {
        $coupon = Coupon::where('code', '=', $code)->first();

        if (!$coupon || !$coupon->isValid()) {
            throw ValidationException::withMessages([
                'coupon' => 'Ce code promo est invalide ou expiré.'
            ]);
        }

        // Vérification du montant minimum
        $subtotal = $this->getSubtotal();
        if ($coupon->min_order_amount && $subtotal < $coupon->min_order_amount) {
            throw ValidationException::withMessages([
                'coupon' => "Le montant minimum pour ce coupon est de {$coupon->min_order_amount}."
            ]);
        }

        $this->cart->coupon_id = $coupon->id;
        $this->cart->save();
        $this->cart->load('coupon'); // Recharger la relation
    }

    /**
     * Retirer le coupon
     */
    public function removeCoupon(): void
    {
        $this->cart->coupon_id = null;
        $this->cart->save();
    }

    /**
     * Calcule le sous-total (sans réduction)
     */
    public function getSubtotal(): float
    {
        return $this->cart->items->sum(fn ($item) => $item->price * $item->quantity);
    }

    /**
     * Calcule le montant de la réduction
     */
    public function getDiscountAmount(): float
    {
        if (!$this->cart->coupon) {
            return 0;
        }

        $subtotal = $this->getSubtotal();
        $coupon = $this->cart->coupon;

        // Revérifier la validité (au cas où le panier a changé)
        if ($coupon->min_order_amount && $subtotal < $coupon->min_order_amount) {
            $this->removeCoupon();
            return 0;
        }

        if ($coupon->type === 'fixed') {
            return min($coupon->value, $subtotal); // Ne pas dépasser le total
        } elseif ($coupon->type === 'percent') {
            return $subtotal * ($coupon->value / 100);
        }

        return 0;
    }

    /**
     * Résout le panier : soit celui de l'utilisateur connecté (avec fusion), soit celui de l'invité.
     */
    protected function resolveCart(): Cart
    {
        // 1. Si l'utilisateur est connecté
        if (Auth::check()) {
            // On tente de fusionner un éventuel panier invité
            $this->mergeGuestCart();

            // On retourne le panier de l'utilisateur
            return Cart::firstOrCreate(['user_id' => Auth::id()]);
        }

        // 2. Si c'est un invité
        $guestId = Cookie::get($this->cookieName);

        // Si aucun cookie n'existe, on génère un ID unique et on crée le cookie
        if (! $guestId) {
            $guestId = (string) Str::uuid();
            Cookie::queue($this->cookieName, $guestId, 60 * 24 * 30); // 30 jours
        }

        // On retourne (ou crée) le panier lié à cet ID invité
        return Cart::firstOrCreate(['guest_id' => $guestId]);
    }

    /**
     * Fusionne le panier invité (cookie) dans le panier utilisateur (base de données).
     */
    protected function mergeGuestCart(): void
    {
        $guestId = Cookie::get($this->cookieName);

        // Pas de cookie invité ? Rien à faire.
        if (! $guestId) {
            return;
        }

        // On cherche le panier invité correspondant
        $guestCart = Cart::where('guest_id', '=', $guestId)->with('items')->first();

        // Pas de panier trouvé en base pour cet invité ? Rien à faire.
        if (! $guestCart) {
            return;
        }

        // On récupère ou crée le panier de l'utilisateur actuel
        $userCart = Cart::firstOrCreate(['user_id' => Auth::id()]);

        // On déplace chaque item du panier invité vers le panier utilisateur
        foreach ($guestCart->items as $guestItem) {
            // Vérifie si l'item existe déjà dans le panier utilisateur (Même produit + Même variante)
            $existingItem = $userCart->items()
                ->where('product_id', '=', $guestItem->product_id)
                ->where('variant_id', '=', $guestItem->variant_id)
                ->first();

            if ($existingItem) {
                // CAS 1 : L'article existe déjà -> On additionne les quantités
                $existingItem->quantity += $guestItem->quantity;
                $existingItem->save();
            } else {
                // CAS 2 : L'article est nouveau -> On change simplement son propriétaire (cart_id)
                $guestItem->cart_id = $userCart->id;
                $guestItem->save();
            }
        }

        // Nettoyage : On supprime l'ancien panier invité de la BDD
        $guestCart->delete();

        // On oublie le cookie pour ne pas refaire l'opération inutilement
        Cookie::queue(Cookie::forget($this->cookieName));
    }

    // --- Méthodes existantes (inchangées) ---

    public function addProduct(int $productId, ?int $variantId, int $quantity = 1): CartItem
    {
        $product = Product::findOrFail($productId);
        $variant = $variantId ? ProductVariant::findOrFail($variantId) : null;

        $price = $variant ? $variant->price : $product->base_price;

        $cartItem = $this->cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = $this->cart->items()->create([
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'price' => $price,
            ]);
        }

        return $cartItem;
    }

    public function removeProduct(int $productId, ?int $variantId = null): void
    {
        $this->cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->delete();
    }

    public function updateQuantity(int $productId, ?int $variantId, int $quantity): ?CartItem
    {
        $cartItem = $this->cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($cartItem) {
            if ($quantity <= 0) {
                $cartItem->delete();

                return null;
            }
            $cartItem->quantity = $quantity;
            $cartItem->save();
        }

        return $cartItem;
    }

    public function getCart(): Cart
    {
        // On charge aussi le coupon
        return $this->cart->load('items.product', 'items.variant', 'coupon');
    }

    /**
     * (Override) Calcule le total final à payer
     */
    public function getTotal(): float
    {
        return max(0, $this->getSubtotal() - $this->getDiscountAmount());
    }

    public function clear(): void
    {
        $this->cart->items()->delete();
    }
}
