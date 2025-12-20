export type Category = "Tous" | "Œufs de Table" | "Poules Pondeuses" | "Poussins" | "Aliments & Matériel" | "Produits Fermiers";

export interface Product {
    id: string;
    name: string;
    category: Category;
    price: number;
    currency: string;
    origin: string;
    image: string;
    isAvailable: boolean;
    badge?: string; // Nouveau: pour afficher "Best-seller", "Nouveau", etc.
}
