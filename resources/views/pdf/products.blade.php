<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Inventaire des Produits</title>
    <style>
        @page {
            margin: 28px 0;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 13px;
            line-height: 1.6;
            color: #334155;
            /* Slate 700 */
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
            background-color: rgb(236, 140, 0);
            /* Primary color */
            z-index: 1000;
        }

        .container {
            padding: 30px 40px;
            position: relative;
        }

        /* HEADER */
        .header-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
        }

        .logo-img {
            max-height: 60px;
            object-fit: contain;
        }

        .document-title {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            /* Slate 900 */
            text-transform: uppercase;
            letter-spacing: -1px;
            margin: 0;
            text-align: right;
        }

        .document-date {
            font-size: 14px;
            color: #64748b;
            text-align: right;
            margin-top: 5px;
        }

        /* DETAILS TABLE */
        .details-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .details-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .details-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            vertical-align: middle;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .item-name {
            font-weight: 600;
            color: #1e293b;
            display: block;
            font-size: 13px;
        }

        .item-variant {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
        }

        .sku-badge {
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            color: #475569;
            margin-top: 4px;
            display: inline-block;
        }

        .img-container {
            width: 50px;
            height: 50px;
            border-radius: 6px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .img-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: cover;
        }

        /* COLONNE A REMPLIR */
        .fill-box {
            width: 60px;
            height: 25px;
            border: 1px dashed #94a3b8;
            margin: 0 auto;
            border-radius: 4px;
        }

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
                        <h1 style="color: rgb(236, 140, 0); margin: 0; font-size: 24px;">{{ $company['name'] ?? 'Nom de l\'Entreprise' }}</h1>
                    @endif
                </td>
                <td style="width: 50%; vertical-align: middle;">
                    <div class="document-title">INVENTAIRE PRODUITS</div>
                    <div class="document-date">Édité le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}</div>
                </td>
            </tr>
        </table>

        <table class="details-table">
            <thead>
                <tr>
                    <th style="width: 10%;">Image</th>
                    <th style="width: 40%;">Produit & Variantes</th>
                    <th class="text-right" style="width: 15%;">Prix Unit.</th>
                    <th class="text-center" style="width: 15%;">En Stock</th>
                    <th class="text-center" style="width: 20%;">Qté Requise</th>
                </tr>
            </thead>
            <tbody>
                @foreach($products as $product)
                    @if($product->variants && $product->variants->count() > 0)
                        {{-- Boucle sur les variantes du produit --}}
                        @foreach($product->variants as $variant)
                            @php
                                // Formatage des options de la variante (ex: Taille: M / Couleur: Rouge)
                                $variantOptions = $variant->options->map(fn($o) => $o->attribute->name . ': ' . $o->option->name)->join(' / ');

                                // Gestion de l'image (si variante a une image, sinon image du produit principal)
                                // Note: pour dompdf, il est préférable d'utiliser des chemins locaux absolus s'ils sont publics.
                                $imageUrl = $variant->getFirstMediaPath('image') ?: $product->getFirstMediaPath('images');
                            @endphp
                            <tr>
                                <td>
                                    <div class="img-container">
                                        @if($imageUrl)
                                            <img src="{{ $imageUrl }}" alt="img">
                                        @endif
                                    </div>
                                </td>
                                <td>
                                    <span class="item-name">{{ $product->name }}</span>
                                    @if($variantOptions)
                                        <div class="item-variant">{{ $variantOptions }}</div>
                                    @endif
                                    @if($variant->sku)
                                        <span class="sku-badge">SKU: {{ $variant->sku }}</span>
                                    @endif
                                </td>
                                <td class="text-right">{{ number_format($variant->price, 0, ',', ' ') }} FCFA</td>
                                <td class="text-center">
                                    <span style="font-weight: 600; color: {{ $variant->quantity > 0 ? '#166534' : '#dc2626' }};">
                                        {{ $variant->quantity }}
                                    </span>
                                </td>
                                <td>
                                    <div class="fill-box"></div>
                                </td>
                            </tr>
                        @endforeach
                    @else
                        {{-- Produit simple sans variantes --}}
                        @php
                            $imageUrl = $product->getFirstMediaPath('images');
                        @endphp
                        <tr>
                            <td>
                                <div class="img-container">
                                    @if($imageUrl)
                                        <img src="{{ $imageUrl }}" alt="img">
                                    @endif
                                </div>
                            </td>
                            <td>
                                <span class="item-name">{{ $product->name }}</span>
                                {{-- Pas de variante, mais potentiellement un SKU global s'il est géré sur le modèle Product --}}
                                @if(isset($product->sku))
                                    <span class="sku-badge">SKU: {{ $product->sku }}</span>
                                @endif
                            </td>
                            <td class="text-right">{{ number_format($product->base_price ?? 0, 0, ',', ' ') }} FCFA</td>
                            <td class="text-center">
                                <span style="font-weight: 600; color: {{ ($product->quantity ?? 0) > 0 ? '#166534' : '#dc2626' }};">
                                    {{ $product->quantity ?? 0 }}
                                </span>
                            </td>
                            <td>
                                <div class="fill-box"></div>
                            </td>
                        </tr>
                    @endif
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        Document généré le {{ \Carbon\Carbon::now()->format('d/m/Y') }} par le système de gestion {{ $company['name'] ?? 'Interne' }}.
    </div>
</body>

</html>
