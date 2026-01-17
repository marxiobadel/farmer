<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function orangeMoney(Request $request)
    {
        $data = json_decode($request->getContent(), true);

        return $this->handlePayment($data, 'payToken', 'status', 'message');
    }

    public function mtnMoney(Request $request)
    {
        $data = json_decode($request->getContent(), true);

        return $this->handlePayment($data, 'MessageId', 'Status', 'body');
    }

    private function normalizeStatus(string $status): string
    {
        $status = strtolower($status);

        return in_array($status, ['successful', 'successfull']) ? 'completed' : $status;
    }

    private function handlePayment(array $data, string $tokenKey, string $statusKey, string $messageKey)
    {
        file_put_contents(public_path('webhook_log_transaction_id.txt'), json_encode($data), FILE_APPEND);

        if (! isset($data[$tokenKey], $data[$statusKey])) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $payment = Payment::with('order')->where('transaction_id', '=', $data[$tokenKey])->first();

        if (! $payment) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        $payment->status = $this->normalizeStatus($data[$statusKey]);

        $payment->message = $data[$messageKey] ?? null;
        $payment->save();

        $order = $payment->order;
        if ($order && $payment->status === 'completed') {
            $order->status = 'completed';
            $order->save();
        }

        return response()->json(['message' => 'Transaction processed'], 200);
    }
}
