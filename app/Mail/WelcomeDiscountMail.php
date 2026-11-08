<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeDiscountMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $promoCode,
        public string $expirationDate
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre bon de réduction de bienvenue - MontView Farm',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome-discount',
        );
    }
}
