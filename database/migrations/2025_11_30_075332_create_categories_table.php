<?php

use App\Enums\CategoryType;
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
        $categoryType = CategoryType::values();

        Schema::create('categories', function (Blueprint $table) use ($categoryType) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->enum('type', $categoryType)->default(reset($categoryType))->change();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
