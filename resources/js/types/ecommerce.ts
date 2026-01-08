import { Variant } from ".";

export interface Product {
    id: string;
    name: string;
    category: string; // Changé en string pour plus de souplesse
    price: number;
    currency: string;
    origin: string;
    image: string;
    isAvailable: boolean;
    badge?: string;
    slug: string;
    variant_name?: string | null;
    variants: Variant[];
    availableQty?: number;
    is_favorited?: boolean;
}
