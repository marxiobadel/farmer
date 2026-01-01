<x-mail::message>
# C'est pour aujourd'hui ! 🚚

Bonjour {{ $order->user->fullname }},

Votre commande **#{{ $order->id }}** est en cours de livraison. Notre livreur devrait passer dans la journée à l'adresse indiquée.

Merci de vous assurer qu'une personne est présente pour réceptionner le colis.

<x-mail::panel>
Montant à régler (si paiement à la livraison) : **{{ number_format($order->total, 0, ',', ' ') }} FCFA**
</x-mail::panel>

<x-mail::button :url="url('/dashboard/orders/' . $order->id)">
Voir ma commande
</x-mail::button>

À très vite,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
