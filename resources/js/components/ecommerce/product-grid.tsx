import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { adaptProductToCard } from "@/lib/utils";

interface ProductGridProps {
    products: Product[];
    selectedCategoryName: string;
}

export const ProductGrid = ({ products, selectedCategoryName }: ProductGridProps) => {
    return (
        <div className="container max-w-7xl mx-auto px-4 py-16 sm:py-20 md:py-24">
            <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-2xl font-bold text-stone-900">
                    {selectedCategoryName === "Tous" ? "Catalogue Complet" : selectedCategoryName}
                </h2>
                <span className="text-sm text-stone-500">{products.length} résultats</span>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {products.map(adaptProductToCard).map((product) => (
                        <div key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 py-32 text-center">
                    <div className="mx-auto h-12 w-12 text-stone-300 mb-4 text-4xl">🥚</div>
                    <h3 className="text-lg font-medium text-stone-900">Aucun produit trouvé</h3>
                    <p className="text-stone-500">
                        Cette catégorie est vide pour le moment.
                    </p>
                </div>
            )}
        </div>
    );
};
