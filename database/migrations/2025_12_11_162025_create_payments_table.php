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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            // Link to Order
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');

            // Optional: Link to User for faster queries (e.g., "My Payments")
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            // Payment Identifiers
            $table->string('reference')->nullable(); // Your internal unique ID (e.g., PAY-839283)
            $table->string('transaction_id')->nullable(); // External ID (Stripe ID, OM Transaction ID)

            // Payment Details
            $table->string('method'); // e.g., 'credit_card', 'om', 'momo', 'paypal', 'cash'
            $table->string('provider')->nullable(); // e.g., 'stripe', 'cinetpay', 'flutterwave'

            // Financials
            $table->float('amount'); // 12,2 is better for currencies like XAF/XOF
            $table->string('currency', 3)->default('XAF'); // ISO Code

            // State
            $table->string('status')->default('pending'); // pending, completed, failed, refunded, cancelled

            // Debugging / Gateway Data
            $table->json('details')->nullable(); // Store the raw response from the provider here

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            // Index for faster searching
            $table->index(['reference', 'transaction_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
