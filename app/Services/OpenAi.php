<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAi
{
    public function ask(string $instruction, string $model = 'gpt-5', ?string $fileUrl = null)
    {
        $content = [
            ['type' => 'input_text', 'text' => $instruction],
        ];

        if (! empty($fileUrl)) {
            $content[] = ['type' => 'input_file', 'file_url' => $fileUrl];
        }

        $payload = [
            'model' => $model,
            'input' => [
                [
                    'role' => 'user',
                    'content' => $content,
                ],
            ],
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer '.config('services.openai.key'),
        ])->timeout(3600)->post('https://api.openai.com/v1/responses', $payload);

        if ($response->failed()) {
            Log::error('OpenAI Responses API error', ['body' => $response->body()]);
            throw new Exception('Erreur de communication avec OpenAI');
        }

        return $this->extractText($response->json());
    }

    protected function extractText(array $response): ?string
    {
        return collect(data_get($response, 'output', []))
            ->firstWhere('type', 'message')['content'][0]['text'] ?? null;
    }
}
