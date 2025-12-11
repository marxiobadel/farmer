<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected Cart $cart;

    public function __construct()
    {
        $this->cart = Cart::firstOrCreate(['user_id' => Auth::id()]);
    }

    /**
     * Créer une commande à partir du panier
     */
    public function createOrder(array $shippingAddress, string $status = 'pending'): Order
    {
        $cartItems = $this->cart->items()->with('product', 'variant')->get();

        if ($cartItems->isEmpty()) {
            throw new \Exception('Le panier est vide.');
        }

        return DB::transaction(function () use ($cartItems, $shippingAddress, $status) {
            $order = Order::create([
                'user_id' => Auth::id(),
                'status' => $status,
                'total' => $cartItems->sum(fn($item) => $item->price * $item->quantity),
                'shipping_address' => $shippingAddress,
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]);
            }

            // Vider le panier après la création de la commande
            $this->cart->items()->delete();

            return $order;
        });
    }

    // Récupérer toutes les commandes de l'utilisateur
    public function getUserOrders()
    {
        return Order::where('user_id', Auth::id())->with('items.product', 'items.variant')->get();
    }

    // Mettre à jour le statut d'une commande
    public function updateStatus(Order $order, string $status): Order
    {
        $order->status = $status;
        $order->save();

        return $order;
    }
}
