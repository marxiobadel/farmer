<?php

namespace App\Observers;

use App\Models\StockMovement;

class StockMovementObserver
{
    public function creating(StockMovement $movement): void
    {
        // 1. Déterminer quel objet modifier (Variante ou Produit)
        $target = $movement->variant_id ? $movement->variant : $movement->product;

        if ($target) {
            // 2. Enregistrer l'état "Avant" et "Après" pour l'historique
            $movement->stock_before = $target->quantity;
            $movement->stock_after = $target->quantity + $movement->quantity;
        }
    }

    public function created(StockMovement $movement): void
    {
        // 3. Mettre à jour le stock réel sur la table Products ou Variants
        $target = $movement->variant_id ? $movement->variant : $movement->product;

        if ($target) {
            // On incrémente (si quantity est positif) ou décrémente (si négatif)
            $target->increment('quantity', $movement->quantity);
        }
    }
}
