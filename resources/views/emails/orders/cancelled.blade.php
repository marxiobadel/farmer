<x-mail::message>
# Annulation de commande

Bonjour {{ $order->user->name }},

Nous vous informons que votre commande **#{{ $order->id }}** a été annulée.

Si vous avez déjà effectué un paiement, le remboursement sera traité automatiquement dans les plus brefs délais selon nos conditions générales de vente.

<x-mail::panel>
Si cette annulation est une erreur ou si vous souhaitez repasser commande, notre support est à votre disposition.
</x-mail::panel>

<x-mail::button :url="url('/contact')">
Contacter le support
</x-mail::button>

Cordialement,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
