<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Le code (ex: SUMMER2025)
            $table->enum('type', ['fixed', 'percent']); // Remise fixe ou pourcentage
            $table->decimal('value', 10, 2); // Valeur de la remise
            $table->decimal('min_order_amount', 10, 2)->nullable(); // Montant min pour l'utiliser
            $table->timestamp('expires_at')->nullable(); // Date d'expiration
            $table->integer('usage_limit')->nullable(); // Limite globale d'utilisation
            $table->integer('usage_count')->default(0); // Compteur d'utilisation
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Modification de la table carts pour stocker le coupon appliqué
        Schema::table('carts', function (Blueprint $table) {
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('status');
            $table->decimal('discount', 10, 2)->default(0)->after('total');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
