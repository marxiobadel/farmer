import type { Category, Product } from "@/types/ecommerce";
import { useMemo } from "react";
import { ProductCard } from "./product-card";
import { AnimatePresence, motion } from "framer-motion";

interface ProductGridProps {
    selectedCategory: Category;
}

const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Alvéole d'œufs (Gros Calibre)",
        category: "Œufs de Table",
        price: 2800,
        currency: "FCFA",
        origin: "Ferme Montview",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: true,
        badge: "Best-seller"
    },
    {
        id: "2",
        name: "Poule Pondeuse Lohmann (18 sem.)",
        category: "Poules Pondeuses",
        price: 4500,
        currency: "FCFA",
        origin: "Ferme Montview",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: true,
        badge: "Prête à pondre"
    },
    {
        id: "3",
        name: "Alvéole d'œufs (Moyen Calibre)",
        category: "Œufs de Table",
        price: 2500,
        currency: "FCFA",
        origin: "Ferme Montview",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: true,
    },
    {
        id: "4",
        name: "Sac Aliment Démarrage (50kg)",
        category: "Aliments & Matériel",
        price: 22000,
        currency: "FCFA",
        origin: "SPC",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: true,
    },
    {
        id: "5",
        name: "Carton de 50 poussins (Chair)",
        category: "Poussins",
        price: 37500,
        currency: "FCFA",
        origin: "Couvoir Montview",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: false, // Rupture
    },
    {
        id: "6",
        name: "Poule de Réforme (Chair)",
        category: "Poules Pondeuses",
        price: 3000,
        currency: "FCFA",
        origin: "Ferme Montview",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: true,
        badge: "Promo"
    },
    {
        id: "7",
        name: "Huile de Palme Naturelle (5L)",
        category: "Produits Fermiers",
        price: 6000,
        currency: "FCFA",
        origin: "Pressoir Local",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: true,
    },
    {
        id: "8",
        name: "Mangeoire Trémie 5kg",
        category: "Aliments & Matériel",
        price: 3500,
        currency: "FCFA",
        origin: "Import",
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop",
        isAvailable: true,
    },
];

export const ProductGrid = ({ selectedCategory }: ProductGridProps) => {
    const filteredProducts = useMemo(() => {
        if (selectedCategory === "Tous") return MOCK_PRODUCTS;
        return MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <div className="container max-w-7xl mx-auto px-4 py-16 sm:py-20 md:py-24">
            <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl font-bold text-stone-900">
                    {selectedCategory === "Tous" ? "Catalogue Complet" : selectedCategory}
                </h2>
                <span className="text-sm text-stone-500">{filteredProducts.length} résultats</span>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 py-32 text-center">
                    <div className="mx-auto h-12 w-12 text-stone-300 mb-4 text-4xl">🥚</div>
                    <h3 className="text-lg font-medium text-stone-900">Stock épuisé</h3>
                    <p className="text-stone-500">
                        Nos produits partent vite ! Revenez demain matin pour le nouvel arrivage.
                    </p>
                </div>
            )}
        </div>
    );
};
