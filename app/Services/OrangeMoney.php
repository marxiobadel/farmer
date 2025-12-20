<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OrangeMoney
{
    const BASE_URL = 'https://api.orange.com/';

    private ?string $token = null;

    private string $authHeader;

    private string $merchantKey;

    private string $returnUrl;

    private string $cancelUrl;

    private string $notifUrl;

    public function __construct()
    {
        $this->authHeader = config('services.om.auth_header');
        $this->merchantKey = config('services.om.merchant_key');

        $this->returnUrl = '';
        $this->cancelUrl = '';
        $this->notifUrl = '';
    }

    /**
     * Request API
     */
    private function apiCall(string $method, string $endpoint, array $options = [])
    {
        try {
            $response = Http::withOptions(['base_uri' => self::BASE_URL])
                ->send($method, $endpoint, $options);

            // If HTTP error (4xx/5xx)
            if ($response->failed()) {
                return [
                    'status' => 'error',
                    'message' => $response->body(),
                    'code' => $response->status(),
                ];
            }

            return $response->json();
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate & store token
     */
    public function getAccessToken(): array
    {
        $options = [
            'headers' => [
                'Authorization' => 'Basic '.$this->authHeader,
                'Accept' => 'application/json',
            ],
            'form_params' => [
                'grant_type' => 'client_credentials',
            ],
        ];

        $data = $this->apiCall('POST', 'oauth/v3/token', $options);

        if (! empty($data['access_token'])) {
            $this->token = $data['access_token'];
        }

        return $data;
    }

    /**
     * Make a web payment
     */
    public function webPayment(array $data)
    {
        $this->ensureToken();

        $body = array_merge([
            'merchant_key' => $this->merchantKey,
            'currency' => 'XAF',
            'amount' => 0,
            'return_url' => $this->returnUrl,
            'cancel_url' => $this->cancelUrl,
            'notif_url' => $this->notifUrl,
            'lang' => 'fr',
            'reference' => __('Paiement via Orange Money'),
        ], $data);

        return $this->apiCall('POST', 'orange-money-webpay/cm/v1/webpayment', [
            'headers' => [
                'Authorization' => 'Bearer '.$this->token,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'json' => $body,
        ]);
    }

    /**
     * Check payment status
     */
    public function checkTransactionStatus(string $orderId, int $amount, string $payToken)
    {
        $this->ensureToken();

        $body = [
            'order_id' => $orderId,
            'amount' => $amount,
            'pay_token' => $payToken,
        ];

        return $this->apiCall('POST', 'orange-money-webpay/cm/v1/transactionstatus', [
            'headers' => [
                'Authorization' => 'Bearer '.$this->token,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
            'json' => $body,
        ]);
    }

    /**
     * Auto-generate token if not available
     */
    private function ensureToken(): void
    {
        if (! $this->token) {
            $this->getAccessToken();
        }
    }
}
