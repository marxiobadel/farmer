<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        // Nettoyage: ajout d'un saut de ligne pour éviter un fichier illisible
        file_put_contents(public_path('webhook_log_transaction_id.txt'), json_encode($data) . PHP_EOL, FILE_APPEND);

        if (! isset($data[$tokenKey], $data[$statusKey])) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        // Utilisation d'une transaction pour bloquer la ligne Payment pendant le traitement
        return DB::transaction(function () use ($data, $tokenKey, $statusKey, $messageKey) {
            /**
             * @var Payment|null $payment
             */
            $payment = Payment::with('order')
                ->where('transaction_id', '=', $data[$tokenKey])
                ->lockForUpdate() // Empêche une 2ème requête parallèle de modifier ce paiement
                ->first();

            if (! $payment) {
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            // IDEMPOTENCE : Si déjà complété, on répond 200 immédiatement pour dire à l'API d'arrêter d'envoyer
            if ($payment->status === 'completed') {
                return response()->json(['message' => 'Transaction already processed'], 200);
            }

            $newStatus = $this->normalizeStatus($data[$statusKey]);
            $payment->status = $newStatus;
            $payment->message = $data[$messageKey] ?? null;
            $payment->save();

            $order = $payment->order;
            if ($order && $payment->status === 'completed') {
                $order->status = 'completed';
                $order->save();

                // PISTE D'AMÉLIORATION : C'est ici qu'il faudrait déclencher un Job asynchrone
                // pour envoyer la facture et le SMS, par exemple :
                // SendOrderConfirmationJob::dispatch($order);
            }

            return response()->json(['message' => 'Transaction processed'], 200);
        });
    }
}
