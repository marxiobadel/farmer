import { useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { PackageSearch, Sparkles } from "lucide-react";
import { Product } from "@/types";
import type { Product as EcommerceProduct } from "@/types/ecommerce";
import { ProductCard } from "./product-card";
import { adaptProductToCard } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
    products: Product[];
    selectedCategoryName: string;
    onResetCategory?: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
        },
    },
};

export const ProductGrid = ({
    products,
    selectedCategoryName,
    onResetCategory,
}: ProductGridProps) => {
    const adaptedProducts = useMemo<EcommerceProduct[]>(() => {
        return products.map(adaptProductToCard);
    }, [products]);

    return (
        <div className="w-full">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-5 mb-8">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Sélection Fraîcheur</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                        {selectedCategoryName === "Tous" ? "Catalogue Complet" : selectedCategoryName}
                    </h2>
                </div>

                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    <span className="font-bold text-foreground">{products.length}</span>{" "}
                    {products.length > 1 ? "produits disponibles" : "produit disponible"}
                </p>
            </div>

            {/* Product List or Empty State */}
            <AnimatePresence mode="wait">
                {adaptedProducts.length > 0 ? (
                    <motion.div
                        key={selectedCategoryName}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6"
                    >
                        {adaptedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/50 py-20 px-6 text-center backdrop-blur-xs"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4 shadow-inner">
                            <PackageSearch className="h-7 w-7 opacity-60" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Aucun produit dans cette catégorie</h3>
                        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Nous n'avons actuellement aucun article répertorié sous "{selectedCategoryName}". Nos récoltes et disponibilités varient chaque matin.
                        </p>
                        {onResetCategory && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onResetCategory}
                                className="mt-6 rounded-full border-border hover:border-primary hover:text-primary transition-colors"
                            >
                                Afficher tous les produits
                            </Button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
