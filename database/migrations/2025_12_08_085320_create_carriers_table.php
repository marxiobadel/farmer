<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->integer('country_id')->unsigned()->nullable();
            $table->foreign('country_id')->references('id')->on('countries')->onDelete('SET NULL')->onUpdate('cascade');
            $table->timestamps();
        });

        /**
         * Prix fixe (ex: 5 € par commande)
         * Par poids (ex: 3 € pour 0–2 kg, 5 € pour 2–5 kg…)
         * Par tranche de prix de commande (ex: livraison gratuite > 100 €)
         * Par volume
         */
        Schema::create('carriers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->float('base_price')->default(0);
            $table->float('free_shipping_min')->nullable(); // seuil de gratuité
            $table->boolean('is_active')->default(true);

            $table->enum('pricing_type', ['fixed', 'weight', 'price', 'volume'])->default('fixed');
            $table->timestamps();
        });

        Schema::create('carrier_zone', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrier_id')->constrained()->onDelete('cascade');
            $table->foreignId('zone_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('carrier_rates', function (Blueprint $table) {
            $table->id();

            $table->float('min_weight')->nullable();
            $table->float('max_weight')->nullable();

            $table->float('min_price')->nullable();
            $table->float('max_price')->nullable();

            $table->float('min_volume')->nullable();
            $table->float('max_volume')->nullable();

            $table->float('rate_price'); // le tarif à appliquer

            $table->foreignId('carrier_id')->constrained()->onDelete('cascade');
            $table->foreignId('zone_id')->nullable()->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carriers');
    }
};
