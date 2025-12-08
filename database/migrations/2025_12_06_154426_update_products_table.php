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
        Schema::table('products', function (Blueprint $table) {
            $table->bigInteger('default_image_id')->nullable()->after('slug');
            $table->float('length')->nullable()->after('status');
            $table->float('width')->nullable()->after('status');
            $table->float('height')->nullable()->after('status');
            $table->float('weight')->nullable()->after('status');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->boolean('is_default')->default(false)->after('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            //
        });
    }
};
