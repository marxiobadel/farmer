<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class CartService
{
    protected Cart $cart;
    protected string $cookieName = 'cart_guest_id';

    public function __construct()
    {
        $this->cart = $this->resolveCart();
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

        $price = $variant ? $variant->price : $product->price;

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
        return $this->cart->load('items.product', 'items.variant');
    }

    public function getTotal(): float
    {
        return $this->cart->items->sum(fn ($item) => $item->price * $item->quantity);
    }

    public function clear(): void
    {
        $this->cart->items()->delete();
    }
}
