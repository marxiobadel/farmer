<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OrangeMoney
{
    private const BASE_URL = 'https://api-s1.orange.cm/';

    private string $username;

    private string $password;

    private string $channelUserMsisdn;

    private string $pin;

    private string $xAuthToken;

    private string $notifUrl;

    private ?string $accessToken = null;

    public function __construct()
    {
        $this->username = config('services.om.username');
        $this->password = config('services.om.password');
        $this->channelUserMsisdn = config('services.om.channel_user_msisdn');
        $this->pin = config('services.om.pin');
        $this->xAuthToken = config('services.om.x_auth_token');
        $this->notifUrl = route('orange.notify');
    }

    public function getAccessToken(): array
    {
        $credentials = base64_encode("{$this->username}:{$this->password}");

        $response = Http::asForm()
            ->withHeaders([
                'Authorization' => "Basic {$credentials}",
            ])
            ->post(self::BASE_URL.'token', [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->failed()) {
            Log::error('Orange Money token error', $response->json());
            throw new \Exception("Impossible de récupérer le jeton d'accès OM.");
        }

        $data = $response->json();
        $this->accessToken = $data['access_token'];

        return $data;
    }

    private function initPayment(): array
    {
        $response = Http::withToken($this->accessToken)
            ->withHeaders([
                'X-AUTH-TOKEN' => $this->xAuthToken,
            ])
            ->post(self::BASE_URL.'omcoreapis/1.0.2/mp/init');

        if ($response->failed()) {
            Log::error('Orange Money init payment error', $response->json());
            throw new \Exception('Paiement OM non initié.');
        }

        return $response->json();
    }

    public function webPayment(array $payload): array
    {
        $this->getAccessToken();

        $init = $this->initPayment();

        $orderId = 'OM_0'.rand(100000, 900000).'_00'.rand(10000, 90000);

        $body = array_merge([
            'notifUrl' => $this->notifUrl,
            'channelUserMsisdn' => $this->channelUserMsisdn,
            'pin' => (string) $this->pin,
            'orderId' => $orderId,
            'description' => __('Paiement via Orange Money'),
            'payToken' => $init['data']['payToken'],
        ], $payload);

        $response = Http::withToken($this->accessToken)
            ->withHeaders([
                'X-AUTH-TOKEN' => $this->xAuthToken,
            ])
            ->post(self::BASE_URL.'omcoreapis/1.0.2/mp/pay', $body);

        if ($response->failed()) {
            Log::error('Orange Money payment error', $response->json());
            throw new \Exception("Le paiement OM a échoué. ({$this->extractErrorMessage($response)})");
        }

        return $response->json();
    }

    public function checkTransactionStatus(string $payToken): array
    {
        $this->getAccessToken();

        $response = Http::withToken($this->accessToken)
            ->withHeaders([
                'X-AUTH-TOKEN' => $this->xAuthToken,
            ])
            ->get(self::BASE_URL."omcoreapis/1.0.2/mp/paymentstatus/{$payToken}");

        if ($response->failed()) {
            Log::error('Orange Money status error', $response->json());
            throw new \Exception('Impossible de vérifier le statut de paiement.');
        }

        return $response->json();
    }

    private function extractErrorMessage($response): string
    {
        $body = trim($response->body());

        $json = json_decode($body, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            return $json['message']
                ?? $json['error_description']
                ?? $json['error']
                ?? $body;
        }

        return $body;
    }
}
