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
        Schema::create('pro_requests', function (Blueprint $table) {
            $table->id();
            $table->string('company_name'); // Raison sociale
            $table->string('niu')->nullable(); // Numéro contribuable
            $table->string('contact_name'); // Nom du gérant/contact
            $table->string('email');
            $table->string('phone');
            $table->string('activity_sector'); // Restaurant, Hôtel, Commerce...
            $table->string('address');
            $table->text('message')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pro_requests');
    }
};
