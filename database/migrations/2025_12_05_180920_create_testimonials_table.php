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
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();            // Nom du client
            $table->string('position')->nullable(); // Fonction / rôle (ex : CEO, Étudiant)
            $table->string('company')->nullable();  // Entreprise ou organisation
            $table->text('message');           // Témoignage
            $table->integer('rating')->default(0);
            $table->boolean('is_approved')->default(false);
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('product_id')->nullable()->constrained('products');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
