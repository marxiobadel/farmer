<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Auth;

class CartService
{
    protected Cart $cart;

    public function __construct()
    {
        $this->cart = Cart::firstOrCreate(['user_id' => Auth::id()]);
    }

    // Ajouter un produit ou une variante au panier
    public function addProduct(int $productId, ?int $variantId, int $quantity = 1): CartItem
    {
        $product = Product::findOrFail($productId);
        $variant = $variantId ? ProductVariant::findOrFail($variantId) : null;

        $price = $variant ? $variant->price : $product->price;

        // Vérifie si le produit existe déjà dans le panier
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

    // Supprimer un produit du panier
    public function removeProduct(int $productId, ?int $variantId = null): void
    {
        $this->cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->delete();
    }

    // Mettre à jour la quantité
    public function updateQuantity(int $productId, ?int $variantId, int $quantity): CartItem|null
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

    // Retourne le panier actuel
    public function getCart(): Cart
    {
        return $this->cart->load('items.product', 'items.variant');
    }

    // Calculer le total
    public function getTotal(): float
    {
        return $this->cart->items->sum(fn($item) => $item->price * $item->quantity);
    }

    // Vider le panier
    public function clear(): void
    {
        $this->cart->items()->delete();
    }
}
