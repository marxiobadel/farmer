<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Facture #{{ $order->id }}</title>
    <style>
        @page {
            margin: 0cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #334155; /* Slate 700 */
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }

        /* BANDEAU LATÉRAL DÉCORATIF */
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 8px;
            background-color: rgb(236, 140, 0); /* Primary Green */
            z-index: 1000;
        }

        .container {
            padding: 50px 40px;
            position: relative;
        }

        /* HEADER */
        .header-table {
            width: 100%;
            margin-bottom: 50px;
            border-collapse: collapse;
        }
        .logo-img {
            max-height: 60px;
            object-fit: contain;
        }
        .invoice-title {
            font-size: 32px;
            font-weight: 800;
            color: #0f172a; /* Slate 900 */
            text-transform: uppercase;
            letter-spacing: -1px;
            margin: 0;
            text-align: right;
        }
        .invoice-ref {
            font-size: 14px;
            color: #64748b;
            text-align: right;
            margin-top: 5px;
        }

        /* INFORMATION BOXES */
        .info-container {
            width: 100%;
            margin-bottom: 50px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-col {
            width: 48%;
            vertical-align: top;
        }
        .spacer-col {
            width: 4%;
        }

        .box-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8; /* Slate 400 */
            font-weight: 700;
            margin-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
        }
        .company-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
        }
        .address-text {
            color: #475569;
            font-size: 13px;
        }

        /* DETAILS TABLE */
        .details-table {
            width: 100%;
            margin-bottom: 40px;
            border-collapse: collapse;
        }
        .details-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px 15px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
        }
        .details-table td {
            padding: 15px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        .details-table tr:last-child td {
            border-bottom: none;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .item-name {
            font-weight: 600;
            color: #1e293b;
            display: block;
        }
        .item-variant {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
        }

        /* TOTALS SECTION */
        .totals-container {
            width: 100%;
            margin-top: 20px;
            page-break-inside: avoid;
        }
        .totals-table {
            width: 50%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 8px 15px;
            text-align: right;
        }
        .totals-label {
            color: #64748b;
            font-size: 13px;
        }
        .totals-value {
            color: #1e293b;
            font-weight: 600;
        }
        .grand-total-row td {
            padding-top: 15px;
            padding-bottom: 15px;
            border-top: 2px solid rgb(236, 140, 0); /* Primary color line */
            border-bottom: 2px solid rgb(236, 140, 0); /* Primary color line */
            background-color: rgba(236, 140, 0, 0.1); /* Light green bg */
        }
        .grand-total-label {
            color: rgb(236, 140, 0);
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
        }
        .grand-total-value {
            color: rgb(236, 140, 0);
            font-weight: 800;
            font-size: 20px;
        }

        /* STATUS BADGE */
        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .badge-paid { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-pending { background-color: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
        .badge-cancelled { background-color: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        /* FOOTER */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            font-size: 11px;
            color: #94a3b8;
            background-color: #fff;
        }

        /* HELPER */
        .mb-1 { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="sidebar"></div>

    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 50%; vertical-align: middle;">
                    @if(isset($company['logo']) && file_exists($company['logo']))
                        <img src="{{ $company['logo'] }}" alt="Logo" class="logo-img">
                    @else
                        <h1 style="color: #16a34a; margin: 0; font-size: 24px;">{{ $company['name'] }}</h1>
                    @endif
                </td>
                <td style="width: 50%; vertical-align: middle;">
                    <div class="invoice-title">FACTURE</div>
                    <div class="invoice-ref">#{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}</div>
                    <div style="text-align: right; margin-top: 10px;">
                        @php
                            $statusClass = match($order->status) {
                                'completed', 'delivered', 'shipped' => 'badge-paid',
                                'cancelled' => 'badge-cancelled',
                                default => 'badge-pending'
                            };
                            $statusLabel = match($order->status) {
                                'completed' => 'PAYÉE',
                                'delivered' => 'LIVRÉE',
                                'shipped' => 'EXPÉDIÉE',
                                'cancelled' => 'ANNULÉE',
                                default => 'EN ATTENTE'
                            };
                        @endphp
                        <span class="badge {{ $statusClass }}">
                            {{ $statusLabel }}
                        </span>
                    </div>
                </td>
            </tr>
        </table>

        <div class="info-container">
            <table class="info-table">
                <tr>
                    <td class="info-col">
                        <div class="box-title">Vendeur</div>
                        <div class="company-name">{{ $company['name'] }}</div>
                        <div class="address-text">
                            {!! nl2br(e($company['address'])) !!}<br>
                            {{ $company['phone'] }}<br>
                            {{ $company['email'] }}
                        </div>
                    </td>
                    <td class="spacer-col"></td>
                    <td class="info-col">
                        <div class="box-title">Client</div>
                        <div class="company-name">{{ $order->user->firstname }} {{ $order->user->lastname }}</div>
                        <div class="address-text">
                            @if($order->invoice_address)
                                {{ $order->invoice_address['address'] ?? '' }}<br>
                                {{ $order->invoice_address['city'] ?? ''}}<br>
                                {{ $order->invoice_address['phone'] ?? $order->user->phone }}
                            @else
                                {{ $order->user->email }}
                            @endif
                        </div>
                        <div style="margin-top: 15px;">
                            <span style="color:#94a3b8; font-size:11px;">Date de facturation:</span><br>
                            <span style="color:#334155; font-weight:600;">{{ $order->created_at->format('d/m/Y') }}</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <table class="details-table">
            <thead>
                <tr>
                    <th style="width: 45%">Description</th>
                    <th class="text-right" style="width: 15%">Prix Unit.</th>
                    <th class="text-center" style="width: 10%">Qté</th>
                    <th class="text-right" style="width: 20%">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                    @php
                        $variant = $item->variant ? $item->variant->options->map(fn($o) => [
                            'attribute' => $o->attribute->name,
                            'option' => $o->option->name,
                        ]) : null;
                    @endphp
                    <tr>
                        <td>
                            <span class="item-name">{{ $item->product->name }}</span>
                            @if($variant)
                                <div class="item-variant">Variante : {{ $variant->pluck('option')->join(' / ') }}</div>
                            @endif
                        </td>
                        <td class="text-right">{{ number_format($item->price, 0, ',', ' ') }} FCFA</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right" style="font-weight: 600;">{{ number_format($item->price * $item->quantity, 0, ',', ' ') }} FCFA</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals-container">
            <table class="totals-table">
                <tr>
                    <td class="totals-label">Sous-total</td>
                    <td class="totals-value">{{ number_format($order->items->sum(fn($i) => $i->price * $i->quantity), 0, ',', ' ') }} FCFA</td>
                </tr>
                <tr>
                    <td class="totals-label">Frais de livraison</td>
                    <td class="totals-value">
                        @php $shipping = $order->total - $order->items->sum(fn($i) => $i->price * $i->quantity); @endphp
                        {{ $shipping > 0 ? number_format($shipping, 0, ',', ' ') . ' FCFA' : 'Gratuit' }}
                    </td>
                </tr>
                <tr><td colspan="2" style="height: 10px;"></td></tr>

                <tr class="grand-total-row">
                    <td class="grand-total-label">Total à payer</td>
                    <td class="grand-total-value">{{ number_format($order->total, 0, ',', ' ') }} <small style="font-size: 12px; font-weight: normal;">FCFA</small></td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer">
        {{ $company['name'] }} — Merci pour votre confiance.<br>
        Pour toute question concernant cette facture, merci de nous contacter à {{ $company['email'] }}
    </div>
</body>
</html>
