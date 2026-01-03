<?php

namespace App\Enums;

enum OrderStatus: string
{
    // Phase Initial
    case PENDING = 'pending';
    case PROCESSING = 'processing';

    // Logistique Interne
    case PACKING = 'packing';
    case AWAITING_PICKUP = 'awaiting_pickup';

    // Transporteur
    case PICKED_UP = 'picked_up';
    case IN_TRANSIT = 'in_transit';
    case AT_HUB = 'at_hub';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case DELIVERED = 'delivered';

    // Exceptions
    case DELIVERY_ISSUE = 'delivery_issue';
    case WRONG_ADDRESS = 'wrong_address';
    case RECIPIENT_ABSENT = 'recipient_absent';
    case RETURNED = 'returned';

    // Final
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'En attente de paiement',
            self::PROCESSING => 'En traitement',
            self::PACKING => 'En préparation',
            self::AWAITING_PICKUP => 'En attente de ramassage',
            self::PICKED_UP => 'Pris en charge',
            self::IN_TRANSIT => 'En transit',
            self::AT_HUB => 'Arrivé au centre',
            self::OUT_FOR_DELIVERY => 'En cours de livraison',
            self::DELIVERED => 'Livré',
            self::DELIVERY_ISSUE => 'Problème de livraison',
            self::WRONG_ADDRESS => 'Adresse incorrecte',
            self::RECIPIENT_ABSENT => 'Destinataire absent',
            self::RETURNED => 'Retourné',
            self::COMPLETED => 'Terminée',
            self::CANCELLED => 'Annulée',
        };
    }

    // Méthode helper pour les couleurs dans le front ou admin
    public function color(): string
    {
        return match ($this) {
            self::PENDING, self::AWAITING_PICKUP => 'gray',
            self::PROCESSING, self::PACKING => 'blue',
            self::PICKED_UP, self::IN_TRANSIT, self::AT_HUB, self::OUT_FOR_DELIVERY => 'indigo',
            self::DELIVERED, self::COMPLETED => 'green',
            self::CANCELLED, self::RETURNED, self::DELIVERY_ISSUE => 'red',
            self::WRONG_ADDRESS, self::RECIPIENT_ABSENT => 'orange',
        };
    }
}
