<x-mail::message>
# Nouvelle commande reçue !

Une nouvelle commande vient d'être passée sur la boutique.

**Détails de la commande :**
- **Référence :** #{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}
- **Client :** {{ $order->user->fullname }}
- **Montant Total :** {{ number_format($order->total, 0, ',', ' ') }} FCFA
- **Date :** {{ $order->created_at->format('d/m/Y à H:i') }}

<x-mail::button :url="route('admin.orders.show', $order->id)"> Consulter la commande
</x-mail::button>

Merci,<br>
Votre système automatisé {{ config('app.name') }}
</x-mail::message>
