<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class MobileMoney
{
    const AUTH_BASE_URL = "https://omapi-token.ynote.africa/";
    const BASE_URL      = "https://omapi.ynote.africa/prod/";

    private ?string $token = null;

    private string $clientId;
    private string $clientSecret;

    private string $accessKey;
    private string $secretAccessKey;

    private string $notifUrl;

    public function __construct()
    {
        $this->clientId         = config('services.momo.client_id');
        $this->clientSecret     = config('services.momo.client_secret');
        $this->accessKey        = config('services.momo.access_key');
        $this->secretAccessKey  = config('services.momo.secret_access_key');
        $this->notifUrl         = '';
    }

    /**
     * Generic API request handler
     */
    private function apiCall(string $method, string $url, array $options = [])
    {
        try {
            $response = Http::send($method, $url, $options);

            if ($response->failed()) {
                return [
                    "status" => "error",
                    "code"   => $response->status(),
                    "body"   => $response->body()
                ];
            }

            return $response->json();
        } catch (\Exception $e) {
            return [
                "status" => "exception",
                "message" => $e->getMessage()
            ];
        }
    }

    /**
     * Fetch and store token
     */
    public function getAccessToken(): array
    {
        $credentials = base64_encode("{$this->clientId}:{$this->clientSecret}");

        $response = $this->apiCall('POST', self::AUTH_BASE_URL . 'oauth2/token', [
            'headers' => [
                'Authorization' => "Basic $credentials",
                'Content-Type'  => 'application/x-www-form-urlencoded'
            ],
            'form_params' => [
                'grant_type' => 'client_credentials',
            ],
        ]);

        if (!empty($response['access_token'])) {
            $this->token = $response['access_token'];
        }

        return $response;
    }

    /**
     * Ensure token is available
     */
    private function ensureToken(): void
    {
        if (!$this->token) {
            $this->getAccessToken();
        }
    }

    /**
     * Initiate a MOMO payment
     */
    public function webPayment(array $data)
    {
        $this->ensureToken();

        $orderId = "MOMO_0" . rand(100000, 900000) . "_00" . rand(10000, 90000);

        $body = [
            "order_id"       => $orderId,
            "customersecret" => $this->secretAccessKey,
            "customerkey"    => $this->accessKey,
            "PaiementMethod" => "MTN_CMR",
            "notifUrl"       => $this->notifUrl,
            "description"    => __("Paiement via Mobile Money")
        ];

        $payload = ["API_MUT" => array_merge($body, $data)];

        return $this->apiCall('POST', self::BASE_URL . 'webpayment', [
            'headers' => [
                'Authorization' => "Bearer {$this->token}",
                'Content-Type'  => 'application/json'
            ],
            'json' => $payload
        ]);
    }

    /**
     * Check transaction status
     */
    public function checkTransactionStatus(string $messageId)
    {
        $this->ensureToken();

        $body = [
            "customersecret" => $this->secretAccessKey,
            "customerkey"    => $this->accessKey,
            "message_id"     => $messageId
        ];

        return $this->apiCall('POST', self::BASE_URL . 'webpaymentmtn/status', [
            'headers' => [
                'Authorization' => "Bearer {$this->token}",
                'Content-Type'  => 'application/json'
            ],
            'json' => $body
        ]);
    }
}
