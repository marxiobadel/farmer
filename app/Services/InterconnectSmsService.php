<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;

class InterconnectSmsService
{
    protected string $apiUrl;

    protected string $apiKey;

    public function __construct()
    {
        // You can also put these in config (e.g. config/services.php or a custom config)
        $this->apiUrl = config('services.interconnect_sms.url');
        $this->apiKey = config('services.interconnect_sms.api_key');

        if (! $this->apiKey) {
            throw new Exception('Interconnect SMS API key not configured');
        }
    }

    /**
     * Send a single SMS.
     *
     * @param  string  $toPhone  Recipient phone number (in international format)
     * @param  string  $message  The SMS text
     * @param  string  $signature  The SMS signature (sender name)
     * @param  array  $options  Optional parameters: id, sms_lifetime, short_link, unsubscribe_link, hook
     * @return array The API response, decoded JSON
     *
     * @throws Exception on failure / HTTP errors
     */
    public function sendSms(
        string $toPhone,
        string $message,
        string $signature = 'MONTVIEW',
        array $options = []
    ): array {
        // Prepare one message object
        $msg = [
            'type' => 'sms',
            // id: we can use a unique id from your system (or fallback to timestamp)
            'id' => $options['id'] ?? time(),
            'phone' => $this->formatPhoneNumber($toPhone),
            'sms_signature' => $signature,
            'sms_message' => $message,
        ];

        // Add optional fields if provided
        if (isset($options['sms_lifetime'])) {
            $msg['sms_lifetime'] = $options['sms_lifetime'];
        }
        if (isset($options['short_link'])) {
            $msg['short_link'] = (bool) $options['short_link'];
        }
        if (isset($options['unsubscribe_link'])) {
            $msg['unsubscribe_link'] = (bool) $options['unsubscribe_link'];
        }
        if (isset($options['hook'])) {
            $msg['hook'] = $options['hook'];
        }

        // Build the full payload
        $payload = [
            'auth' => $this->apiKey,
            'data' => [
                $msg,
            ],
        ];

        // Send HTTP POST
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])
            ->post($this->apiUrl, $payload);

        if (! $response->successful()) {
            // You may want to log or throw
            throw new Exception('HTTP error when sending SMS: '.$response->status().' — '.$response->body());
        }

        $responseData = $response->json();

        return $responseData;
    }

    protected function formatPhoneNumber(string $phone): string
    {
        // Remove spaces and any non-numeric characters except '+'
        $phone = preg_replace('/\s+/', '', $phone);
        $phone = preg_replace('/[^\d+]/', '', $phone);

        // Remove '+' if it exists
        $phone = ltrim($phone, '+');

        // If number doesn’t start with 237, add it
        if (! str_starts_with($phone, '237')) {
            // Handle if user enters local number like 6xxxxxxxx
            if (str_starts_with($phone, '6') && strlen($phone) === 9) {
                $phone = '237'.$phone;
            } else {
                // Fallback: just ensure 237 prefix
                $phone = '237'.$phone;
            }
        }

        return $phone;
    }
}
