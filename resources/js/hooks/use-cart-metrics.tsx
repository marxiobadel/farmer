import type { Cart, Product } from '@/types';
import { useMemo } from 'react';

export function useCartMetrics(cart: Cart, products: Product[]) {
    return useMemo(() => {
        if (!cart) return { weight: 0, price: 0, volume: 0 };

        return cart.items.reduce((acc, item) => {
            const product = products.find(p => p.id === item.product_id);

            // Calcul du volume (L x l x h) * quantité
            // On suppose que les dimensions sont dans la même unité (ex: cm)
            const itemVolume = (
                (product?.length || 0) * (product?.width || 0) * (product?.height || 0)
            ) * item.quantity;

            return {
                weight: acc.weight + ((product?.weight || 0) * item.quantity),
                price: acc.price + (item.price * item.quantity),
                volume: acc.volume + itemVolume
            };
        }, { weight: 0, price: 0, volume: 0 });
    }, [cart, products]);
}
