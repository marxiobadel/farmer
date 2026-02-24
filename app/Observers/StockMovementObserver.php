<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Exception;

class StockMovementObserver
{
    public function creating(StockMovement $movement): void
    {
        // On récupère la classe du modèle cible
        $targetClass = $movement->variant_id ? ProductVariant::class : Product::class;
        $targetId = $movement->variant_id ?? $movement->product_id;

        // On verrouille la ligne correspondante dans la BDD pour obtenir la VRAIE quantité actuelle
        $target = $targetClass::where('id', $targetId)->lockForUpdate()->first();

        if ($target) {
            // Optionnel mais recommandé : interdire un mouvement qui rendrait le stock négatif
            if ($movement->quantity < 0 && $target->quantity < abs($movement->quantity)) {
                throw new Exception("Opération impossible : stock insuffisant.");
            }

            $movement->stock_before = $target->quantity;
            $movement->stock_after = $target->quantity + $movement->quantity;
        }
    }

    public function created(StockMovement $movement): void
    {
        $targetClass = $movement->variant_id ? ProductVariant::class : Product::class;
        $targetId = $movement->variant_id ?? $movement->product_id;

        // On utilise la méthode atomique increment/decrement de Laravel
        $targetClass::where('id', $targetId)->increment('quantity', $movement->quantity);
    }
}
