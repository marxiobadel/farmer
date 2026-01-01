<x-mail::message>
# Bonjour {{ $order->user->name }},

Votre commande **#{{ $order->id }}** a été expédiée via {{ $order->carrier->name ?? 'notre transporteur' }}.

Le montant total est de : {{ number_format($order->total, 0, ',', ' ') }} FCFA.

<x-mail::button :url="$url">
Voir ma commande
</x-mail::button>

Merci,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
