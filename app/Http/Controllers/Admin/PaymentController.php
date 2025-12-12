<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function updateStatus(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,failed,refunded,cancelled'
        ]);

        $payment->update([
            'status' => $validated['status'],
            // Si on marque comme payé, on met à jour la date
            'paid_at' => $validated['status'] === 'completed' ? now() : $payment->paid_at
        ]);

        return back()->with('success', 'Statut du paiement mis à jour.');
    }
}
