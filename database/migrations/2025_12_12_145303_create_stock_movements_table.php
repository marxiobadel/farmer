<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // database/migrations/xxxx_create_stock_movements_table.php

    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();

            // Lier au produit ET à la variante (optionnel)
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('cascade');

            // Qui a fait l'action ? (Système ou Admin)
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');

            // La quantité (Positif pour entrée, Négatif pour sortie)
            $table->integer('quantity');

            // Raison du mouvement
            // ex: 'sale', 'restock', 'return', 'adjustment', 'damage'
            $table->string('type');

            // Pour lier à une Commande ou une Facture fournisseur (Polymorphisme)
            // ex: reference_type = 'App\Models\Order', reference_id = 12
            $table->nullableMorphs('reference');

            $table->text('note')->nullable(); // Ex: "Inventaire annuel"

            // On garde une copie du stock AVANT et APRÈS ce mouvement (très utile pour debug)
            $table->integer('stock_before')->default(0);
            $table->integer('stock_after')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
