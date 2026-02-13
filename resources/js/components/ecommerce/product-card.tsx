import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import carts from "@/routes/carts";
import products from "@/routes/products";
import { SharedData } from "@/types";
import type { Product } from "@/types/ecommerce";
import { Link, router, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Heart, MapPin, Plus, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const { auth, settings } = usePage<SharedData>().props;

    const [adding, setAdding] = useState(false);
    const [isFavorited, setIsFavorited] = useState(product.is_favorited ?? false);

    const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
    const stockQuantity = defaultVariant ? defaultVariant.quantity : (product.availableQty || 0);
    const isOutOfStock = stockQuantity <= 0;

    // --- NOUVEAU : Calcul de la remise ---
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
        : 0;

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !isFavorited;

        router.post(
            products.favorite(product.slug).url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
                async: true,
                onBefore: () => setIsFavorited(newState),
                onSuccess: () => {
                    if (auth.user) {
                        toast.success("Succès", {
                            description: newState ? "Ajouté aux favoris." : "Retiré des favoris.",
                        });
                    } else {
                        toast.warning("Connexion requise", { description: "Vous devez être connecté." });
                    }
                },
                onError: () => toast.error("Une erreur est survenue."),
                onFinish: () => { if (!auth.user) setIsFavorited(!newState); }
            }
        );
    };

    const handleAddToCart = () => {
        if (isOutOfStock) return;

        router.post(carts.store().url, {
            product_id: product.id,
            variant_id: defaultVariant?.id ?? null,
            quantity: 1
        }, {
            preserveScroll: true,
            preserveState: true,
            onBefore: () => setAdding(true),
            onFinish: () => setAdding(false),
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Ajouté au panier !</span>
                        <span className="text-xs text-stone-500">1x {product.name}</span>
                    </div>
                );
            },
            onError: () => toast.error("Erreur lors de l'ajout au panier.")
        });
    };

    return (
        <motion.div
            key={product.id}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/50 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/20"
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
        >
            {/* --- Zone Image --- */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                />

                {/* Overlay Haut */}
                <div className="absolute inset-x-0 top-0 flex justify-between p-3 z-10">
                    <div className="flex flex-col gap-1.5">
                        {/* BADGE REMISE (NOUVEAU) */}
                        {hasDiscount && (
                            <Badge className="w-fit border-none bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                                -{discountPercentage}%
                            </Badge>
                        )}

                        {product.badge && (
                            <Badge className="w-fit border-none bg-primary/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                                {product.badge}
                            </Badge>
                        )}
                        {!product.isAvailable && (
                            <Badge variant="destructive" className="w-fit px-2.5 py-1 text-xs font-bold shadow-sm">
                                Épuisé
                            </Badge>
                        )}
                    </div>
                    <button
                        onClick={toggleFavorite}
                        className={`group/heart flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition-all hover:bg-white hover:scale-110 active:scale-95 ${isFavorited ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
                    >
                        <Heart className={`h-5 w-5 transition-transform ${isFavorited ? "fill-current" : "group-hover/heart:fill-current"}`} />
                    </button>
                </div>

                {/* Quick Add Button */}
                {product.isAvailable && settings.show_price && (
                    <motion.div
                        className="absolute inset-x-0 bottom-0 p-4 z-20"
                        variants={{
                            hidden: { y: "100%", opacity: 0 },
                            visible: { y: "100%", opacity: 0 },
                            hover: { y: 0, opacity: 1 }
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Button
                            disabled={isOutOfStock || adding}
                            onClick={handleAddToCart}
                            className="w-full h-11 gap-2 rounded-xl bg-stone-900/95 text-white shadow-lg backdrop-blur hover:bg-primary hover:text-white transition-colors duration-300"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="font-medium">Ajout Rapide</span>
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* --- Zone Contenu --- */}
            <div className="flex flex-1 flex-col p-5">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                        <span className="uppercase tracking-wider text-primary/80 font-bold">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md">
                            <MapPin className="h-3 w-3 text-stone-400" />
                            <span className="truncate max-w-[80px]">{product.origin}</span>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-stone-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={products.show(product.slug)} className="focus:outline-none">
                            <span className="absolute inset-0 z-0" aria-hidden="true" />
                            {product.name}
                            {settings.show_price && product.variant_name && (
                                <span className="ml-1 text-sm text-stone-500 font-medium">
                                    ({product.variant_name})
                                </span>
                            )}
                        </Link>
                    </h3>
                </div>

                {/* --- NOUVEAU : PRIX AVEC REMISE --- */}
                {settings.show_price && (
                    <div className="mt-5 flex items-end justify-between border-t border-stone-100 pt-4">
                        <div className="flex flex-col">
                            <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wide mb-0.5">Prix TTC</p>

                            <div className="flex items-baseline gap-2">
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-extrabold tracking-tight ${hasDiscount ? 'text-red-600' : 'text-stone-900'}`}>
                                        {product.price.toLocaleString("fr-FR")}
                                    </span>
                                    <span className={`text-sm font-bold ${hasDiscount ? 'text-red-600/80' : 'text-stone-500'}`}>
                                        {product.currency}
                                    </span>
                                </div>

                                {hasDiscount && (
                                    <span className="text-sm text-stone-400 line-through decoration-stone-400/50 decoration-1">
                                        {product.compare_at_price?.toLocaleString("fr-FR")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="z-10 lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900">
                            <ShoppingBasket className="h-5 w-5" />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
