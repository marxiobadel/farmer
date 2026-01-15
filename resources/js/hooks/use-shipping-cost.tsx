import type { CarrierRate, Zone } from '@/types';
import { useMemo } from 'react';

export function useShippingCost(
    selectedCarrierId: string | null,
    selectedZone: Zone | undefined,
    zoneRates: CarrierRate[],
    cartMetrics: { weight: number; price: number; volume: number; },
    totalQty: number = 1
) {
    return useMemo(() => {
        if (!selectedCarrierId || !selectedZone) return 0;

        // Récupérer les rates spécifiques au transporteur dans cette zone
        const carrierRates = zoneRates.filter(r => String(r.carrier_id) === String(selectedCarrierId));

        // Si pas de rates et que ce n'est pas "fixed", on ne peut pas calculer (sauf si base_price suffit)
        // Mais récupérons d'abord le transporteur via la relation incluse dans le premier rate
        // OU (plus robuste) on cherche dans la liste complete des carriers si vous l'avez,
        // sinon on suppose que carrierRates[0].carrier contient les infos.
        // NOTE: Si carrierRates est vide, il faut trouver l'info du carrier ailleurs (props)
        // ou supposer que "fixed" n'a pas besoin de rates.

        // Pour cet exemple, supposons que nous avons accès à l'objet Carrier complet.
        // Si vous ne l'avez pas dans 'zones', il faut le trouver dans une liste de carriers.
        // Ici je l'extrais du premier rate trouvé, ou je le cherche dans selectedZone.rates
        const carrierInfo = carrierRates.length > 0
            ? carrierRates[0].carrier
            : null;

        if (!carrierInfo) return 0;

        // A. Vérifier la gratuité (Free Shipping) - S'applique à tous les types
        if (carrierInfo.free_shipping_min && cartMetrics.price >= carrierInfo.free_shipping_min) {
            return 0;
        }

        const basePrice = Number(carrierInfo.base_price || 0);
        const type = carrierInfo.pricing_type; // 'fixed', 'weight', 'price', 'volume'

        // B. Cas : Prix Fixe
        if (type === 'fixed') {
            return basePrice;
        }

        // C. Cas : Tranches (Weight, Price, Volume)
        let matchedRate: CarrierRate | undefined;

        switch (type) {
            case 'weight':
                matchedRate = carrierRates.find(rate => {
                    const min = Number(rate.min_weight || 0);
                    const max = rate.max_weight !== null ? Number(rate.max_weight) : Infinity;
                    return cartMetrics.weight >= min && cartMetrics.weight <= max;
                });
                break;

            case 'price':
                matchedRate = carrierRates.find(rate => {
                    const min = Number(rate.min_price || 0);
                    const max = rate.max_price !== null ? Number(rate.max_price) : Infinity;
                    return cartMetrics.price >= min && cartMetrics.price <= max;
                });
                break;

            case 'volume':
                matchedRate = carrierRates.find(rate => {
                    const min = Number(rate.min_volume || 0);
                    const max = rate.max_volume !== null ? Number(rate.max_volume) : Infinity;
                    return cartMetrics.volume >= min && cartMetrics.volume <= max;
                });
                break;

            default:
                // Par défaut (ou si 'weight' est le défaut)
                return basePrice;
        }

        // Si une tranche est trouvée, on ajoute son prix au prix de base
        if (matchedRate) {
            if (matchedRate.coefficient === 'quantity') {
                return basePrice + Number(matchedRate.rate_price) * totalQty;
            } else {
                return basePrice + Number(matchedRate.rate_price);
            }
        }

        // Si aucune tranche ne correspond (ex: trop lourd), on retourne juste le base_price
        // ou on pourrait retourner null pour bloquer la commande.
        return basePrice;

    }, [selectedCarrierId, selectedZone, zoneRates, cartMetrics]);
}
