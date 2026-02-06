<x-mail::message>
@php
$status_labels = [
    'completed' => 'PAYÉE',
    'delivered' => 'LIVRÉE',
    'out_for_delivery' => 'EN COURS DE LIVRAISON',
    'shipped' => 'EXPÉDIÉE',
    'cancelled' => 'ANNULÉE',
    'returned' => 'RETOURNÉE',
    'recipient_absent' => 'DESTINATAIRE ABSENT',
    'wrong_address' => 'ADRESSE INCORRECTE',
    'delivery_issue' => 'PROBLÈME DE LIVRAISON',
    'at_hub' => 'ARRIVÉ AU CENTRE DE DISTRIBUTION',
    'in_transit' => 'EN TRANSIT',
    'awaiting_pickup' => 'EN ATTENTE DE RAMASSAGE',
    'packing' => 'EN PRÉPARATION',
    'processing' => 'EN TRAITEMENT',
    'picked_up' => 'PRIS EN CHARGE PAR LE TRANSPORTEUR',
    'pending' => 'EN ATTENTE DE PAIEMENT',
];
@endphp
# Confirmation de votre commande

Bonjour {{ $order->user->firstname }} {{ $order->user->lastname }},

Nous accusons réception de votre commande **<a href="{{ route("profile.orders.show", [$order->id]) }}">#{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</a>**.

<x-mail::panel>
Si vous avez déjà effectué un paiement, celui-ci sera traité automatiquement dans les plus brefs délais
conformément à nos conditions générales de vente.
</x-mail::panel><br/>

## Détails de la commande

**Numéro :** #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}<br/>
**Date :** {{ $order->created_at->format('d/m/Y') }}<br/>
**Statut :** {{ $status_labels[$order->status] ?? 'EN ATTENTE' }}

## Produits commandés :

<x-mail::table>
| Produit | Qté | Prix U | Total |
|---------|----------|---------------|-------|
@foreach($order->items as $item)
@php
    $variant = $item->variant ? $item->variant->options->map(fn($o) => $o->option->name)->join(' / ') : null;
    $productName = $item->product->name . ($variant ? ' (' . $variant . ')' : '');
@endphp
| {{ $productName }} | x{{ $item->quantity }} | {{ number_format($item->price, 0, ',', ' ') }} FCFA | {{ number_format($item->price * $item->quantity, 0, ',', ' ') }} FCFA |
@endforeach
</x-mail::table>

**Sous-total :** {{ number_format($order->items->sum(fn($i) => $i->price * $i->quantity), 0, ',', ' ') }} FCFA<br/>
**Frais de livraison :** {{ $order->total - $order->items->sum(fn($i) => $i->price * $i->quantity) > 0 ? number_format($order->total - $order->items->sum(fn($i) => $i->price * $i->quantity), 0, ',', ' ') . ' FCFA' : 'Gratuit' }}<br/>
**Total :** **{{ number_format($order->total, 0, ',', ' ') }} FCFA**

Pour voir le statut de votre commande, **<a href="{{ route("profile.orders.show", [$order->id]) }}">cliquez ici</a>**.

<x-mail::button :url="url('/contact')">
Contacter le support
</x-mail::button>

Cordialement,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
