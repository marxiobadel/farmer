<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class WhatsAppService
{
    protected string $token;
    protected string $phoneNumberId;
    protected string $apiVersion;
    protected string $baseUrl;

    public function __construct()
    {
        $this->token = (string) config('services.whatsapp.token');
        $this->phoneNumberId = (string) config('services.whatsapp.phone_number_id');
        $this->apiVersion = (string) config('services.whatsapp.api_version', 'v25.0');
        $this->baseUrl = (string) config('services.whatsapp.base_url', 'https://graph.facebook.com');

        if (empty($this->token) || empty($this->phoneNumberId)) {
            throw new InvalidArgumentException('WhatsApp credentials are not properly configured.');
        }
    }

    /**
     * Send raw payload to the WhatsApp Cloud API.
     */
    public function send(string $to, string $type, array $content, ?string $replyToMessageId = null): array
    {
        $url = "{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages";

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $this->formatPhoneNumber($to),
            'type' => $type,
            $type => $content,
        ];

        if ($replyToMessageId) {
            $payload['context'] = [
                'message_id' => $replyToMessageId,
            ];
        }

        /** @var Response $response */
        $response = Http::withToken($this->token)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, $payload);

        if ($response->failed()) {
            Log::error('WhatsApp Cloud API Request Failed', [
                'url' => $url,
                'status' => $response->status(),
                'response' => $response->json(),
                'payload' => $payload,
            ]);

            $response->throw();
        }

        return $response->json();
    }

    /**
     * Text Message
     */
    public function sendText(string $to, string $body, bool $previewUrl = false, ?string $replyToMessageId = null): array
    {
        return $this->send($to, 'text', [
            'body' => $body,
            'preview_url' => $previewUrl,
        ], $replyToMessageId);
    }

    /**
     * Media Messages: Image, Audio, Video, Document, Sticker
     */
    public function sendImage(string $to, string $linkOrId, ?string $caption = null, bool $isId = false, ?string $replyToMessageId = null): array
    {
        return $this->sendMedia($to, 'image', $linkOrId, $isId, $caption, null, $replyToMessageId);
    }

    public function sendDocument(string $to, string $linkOrId, ?string $filename = null, ?string $caption = null, bool $isId = false, ?string $replyToMessageId = null): array
    {
        return $this->sendMedia($to, 'document', $linkOrId, $isId, $caption, $filename, $replyToMessageId);
    }

    public function sendAudio(string $to, string $linkOrId, bool $isId = false, ?string $replyToMessageId = null): array
    {
        return $this->sendMedia($to, 'audio', $linkOrId, $isId, null, null, $replyToMessageId);
    }

    public function sendVideo(string $to, string $linkOrId, ?string $caption = null, bool $isId = false, ?string $replyToMessageId = null): array
    {
        return $this->sendMedia($to, 'video', $linkOrId, $isId, $caption, null, $replyToMessageId);
    }

    public function sendSticker(string $to, string $linkOrId, bool $isId = false, ?string $replyToMessageId = null): array
    {
        return $this->sendMedia($to, 'sticker', $linkOrId, $isId, null, null, $replyToMessageId);
    }

    protected function sendMedia(
        string $to,
        string $type,
        string $linkOrId,
        bool $isId = false,
        ?string $caption = null,
        ?string $filename = null,
        ?string $replyToMessageId = null
    ): array {
        $content = $isId ? ['id' => $linkOrId] : ['link' => $linkOrId];

        if ($caption !== null && in_array($type, ['image', 'video', 'document'], true)) {
            $content['caption'] = $caption;
        }

        if ($filename !== null && $type === 'document') {
            $content['filename'] = $filename;
        }

        return $this->send($to, $type, $content, $replyToMessageId);
    }

    /**
     * Location Message
     */
    public function sendLocation(string $to, float $latitude, float $longitude, ?string $name = null, ?string $address = null): array
    {
        $content = [
            'latitude' => $latitude,
            'longitude' => $longitude,
        ];

        if ($name)
            $content['name'] = $name;
        if ($address)
            $content['address'] = $address;

        return $this->send($to, 'location', $content);
    }

    /**
     * Contact Card Message
     */
    public function sendContacts(string $to, array $contacts): array
    {
        return $this->send($to, 'contacts', ['contacts' => $contacts]);
    }

    /**
     * Reaction Message (Emoji)
     */
    public function sendReaction(string $to, string $messageId, string $emoji = ''): array
    {
        return $this->send($to, 'reaction', [
            'message_id' => $messageId,
            'emoji' => $emoji, // Pass empty string to remove reaction
        ]);
    }

    /**
     * Interactive Quick Reply Buttons (Up to 3 buttons)
     */
    public function sendButtons(string $to, string $bodyText, array $buttons, ?string $header = null, ?string $footer = null): array
    {
        $formattedButtons = [];
        foreach ($buttons as $id => $title) {
            $formattedButtons[] = [
                'type' => 'reply',
                'reply' => [
                    'id' => (string) $id,
                    'title' => mb_substr($title, 0, 20), // WhatsApp button max length: 20 chars
                ],
            ];
        }

        $interactive = [
            'type' => 'button',
            'body' => ['text' => $bodyText],
            'action' => ['buttons' => $formattedButtons],
        ];

        if ($header) {
            $interactive['header'] = ['type' => 'text', 'text' => $header];
        }
        if ($footer) {
            $interactive['footer'] = ['text' => $footer];
        }

        return $this->send($to, 'interactive', $interactive);
    }

    /**
     * Interactive List Message (Dropdown menu up to 10 rows)
     */
    public function sendList(string $to, string $bodyText, string $buttonText, array $sections, ?string $header = null, ?string $footer = null): array
    {
        $interactive = [
            'type' => 'list',
            'body' => ['text' => $bodyText],
            'action' => [
                'button' => mb_substr($buttonText, 0, 20),
                'sections' => $sections,
            ],
        ];

        if ($header) {
            $interactive['header'] = ['type' => 'text', 'text' => $header];
        }
        if ($footer) {
            $interactive['footer'] = ['text' => $footer];
        }

        return $this->send($to, 'interactive', $interactive);
    }

    /**
     * Pre-approved WhatsApp Template Message
     */
    public function sendTemplate(string $to, string $templateName, string $languageCode = 'en_US', array $components = []): array
    {
        $content = [
            'name' => $templateName,
            'language' => [
                'code' => $languageCode,
            ],
        ];

        if (!empty($components)) {
            $content['components'] = $components;
        }

        return $this->send($to, 'template', $content);
    }

    public function sendCouponTemplate(
        string $to,
        string $firstname,
        string $promoCode,
        string $expirationDate = '30 jours',
        string $templateName = 'coupon_bienvenue',
        string $languageCode = 'fr'
    ): array {
        $components = [
            [
                'type' => 'body',
                'parameters' => [
                    [
                        'type' => 'text',
                        'text' => $firstname,
                    ],
                    [
                        'type' => 'text',
                        'text' => $promoCode,
                    ],
                    [
                        'type' => 'text',
                        'text' => $expirationDate,
                    ],
                ],
            ],
        ];

        return $this->sendTemplate($to, $templateName, $languageCode, $components);
    }

    /**
     * Clean target phone number to E.164 format digits only.
     */
    protected function formatPhoneNumber(string $number): string
    {
        return preg_replace('/[^0-9]/', '', $number);
    }
}
