<x-mail::message>
# Commande Livrée ✅

Bonjour {{ $order->user->name }},

Votre commande **#{{ $order->id }}** a bien été marquée comme livrée. Nous espérons que vous êtes satisfait de vos produits fermiers.

Si vous avez le moindre souci ou une question sur vos produits, n'hésitez pas à nous contacter.

<x-mail::table>
| Produit | Quantité | Prix |
| :--- | :---: | ---: |
@foreach($order->items as $item)
| {{ $item->product->name ?? 'Produit' }} | {{ $item->quantity }} | {{ number_format($item->price, 0, ',', ' ') }} FCFA |
@endforeach
| **Total** | | **{{ number_format($order->total, 0, ',', ' ') }} FCFA** |
</x-mail::table>

<x-mail::button :url="url('/dashboard/orders/' . $order->id)">
Voir la facture
</x-mail::button>

Merci et à bientôt,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
