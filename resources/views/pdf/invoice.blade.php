<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Facture #{{ $order->id }}</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 14px;
            color: #333;
        }

        .container {
            width: 100%;
            margin: 0 auto;
        }

        /* Header */
        .header-table {
            width: 100%;
            margin-bottom: 40px;
        }

        .company-info {
            text-align: right;
        }

        .logo {
            max-height: 60px;
        }

        /* Infos Client & Commande */
        .info-table {
            width: 100%;
            margin-bottom: 30px;
        }

        .bill-to {
            width: 50%;
            vertical-align: top;
        }

        .invoice-details {
            width: 50%;
            text-align: right;
            vertical-align: top;
        }

        /* Tableaux Articles */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            background-color: #f8f9fa;
            border-bottom: 2px solid #ddd;
            padding: 10px;
            text-align: left;
        }

        .items-table td {
            border-bottom: 1px solid #eee;
            padding: 10px;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        /* Totaux */
        .totals-table {
            width: 40%;
            margin-left: auto;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 8px;
        }

        .total-row {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #333;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <table class="header-table">
            <tr>
                <td>
                    <h1>{{ $company['name'] }}</h1>
                </td>
                <td class="company-info">
                    <strong>{{ $company['name'] }}</strong><br>
                    {{ $company['address'] }}<br>
                    {{ $company['phone'] }}<br>
                    {{ $company['email'] }}
                </td>
            </tr>
        </table>

        <table class="info-table">
            <tr>
                <td class="bill-to">
                    <strong>Facturé à :</strong><br>
                    {{ $order->user->firstname }} {{ $order->user->lastname }}<br>
                    @if($order->invoice_address)
                        {{ $order->invoice_address['address'] }}<br>
                        {{ $order->invoice_address['city'] }}
                    @else
                        {{ $order->user->email }}
                    @endif
                </td>
                <td class="invoice-details">
                    <strong>FACTURE N° {{ $order->id }}</strong><br>
                    Date : {{ $order->created_at->format('d/m/Y') }}<br>
                    Statut : {{ ucfirst($order->status) }}
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Prix Unit.</th>
                    <th class="text-center">Qté</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    <tr>
                        <td>
                            {{ $item->product->name }}
                            @if($item->variant)
                                <br><small class="text-muted">{{ $item->variant->name }}</small>
                            @endif
                        </td>
                        <td class="text-right">{{ number_format($item->price, 0, ',', ' ') }} FCFA</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->price * $item->quantity, 0, ',', ' ') }} FCFA</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals-table">
            <tr>
                <td>Sous-total :</td>
                <td class="text-right">
                    {{ number_format($order->items->sum(fn($i) => $i->price * $i->quantity), 0, ',', ' ') }} FCFA
                </td>
            </tr>
            <tr>
                <td>Livraison :</td>
                <td class="text-right">
                    {{ number_format($order->total - $order->items->sum(fn($i) => $i->price * $i->quantity), 0, ',', ' ') }}
                    FCFA
                </td>
            </tr>
            <tr class="total-row">
                <td>Total :</td>
                <td class="text-right">{{ number_format($order->total, 0, ',', ' ') }} FCFA</td>
            </tr>
        </table>

        <div class="footer">
            Merci de votre confiance.
        </div>
    </div>
</body>

</html>
