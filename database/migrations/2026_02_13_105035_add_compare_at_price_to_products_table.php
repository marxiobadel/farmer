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
            $table->float('compare_at_price')->nullable()->after('base_price');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->float('compare_at_price')->nullable()->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('compare_at_price');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('compare_at_price');
        });
    }
};
