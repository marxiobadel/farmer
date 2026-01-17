<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService) {}

    public function index()
    {
        return inertia('front/carts/index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $this->cartService->addProduct(
            $request->input('product_id'),
            $request->input('variant_id'),
            $request->input('quantity')
        );

        return back()->with('success', 'Produit ajouté au panier');
    }

    public function update(Request $request, CartItem $cartItem)
    {
        // 1. Vérification de sécurité : L'article appartient-il au panier de l'utilisateur actuel ?
        $currentCart = $this->cartService->getCart();

        if ($cartItem->cart_id !== $currentCart->id) {
            abort(403, 'Action non autorisée.');
        }

        // 2. Validation
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        // 3. Mise à jour
        $cartItem->update([
            'quantity' => $validated['quantity'],
        ]);

        // 4. Retour (Inertia rechargera automatiquement les props)
        return back()->with('success', 'Panier mis à jour');
    }

    public function destroy(CartItem $cartItem)
    {
        // 1. Vérification de sécurité
        $currentCart = $this->cartService->getCart();

        if ($cartItem->cart_id !== $currentCart->id) {
            abort(403, 'Action non autorisée.');
        }

        // 2. Suppression
        $cartItem->delete();

        // 3. Retour
        return back()->with('success', 'Article supprimé du panier');
    }
}
