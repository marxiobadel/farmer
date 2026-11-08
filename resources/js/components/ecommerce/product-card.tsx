import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { motion, type Variants } from "framer-motion";
import { Heart, MapPin, Plus, ShoppingBasket, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SharedData } from "@/types";
import type { Product } from "@/types/ecommerce";
import carts from "@/routes/carts";
import products from "@/routes/products";
import { login } from "@/routes";

interface ProductCardProps {
    product: Product;
}

const cardItemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    },
};

export const ProductCard = ({ product }: ProductCardProps) => {
    const { auth, settings } = usePage<SharedData>().props;

    const [adding, setAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const [isFavorited, setIsFavorited] = useState(product.is_favorited ?? false);

    const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
    const stockQuantity = defaultVariant ? defaultVariant.quantity : (product.availableQty ?? 0);
    const isOutOfStock = !product.isAvailable || stockQuantity <= 0;

    const hasDiscount = Boolean(product.compare_at_price && product.compare_at_price > product.price);
    const discountPercentage = hasDiscount
        ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
        : 0;

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!auth?.user) {
            toast.warning("Connexion requise", {
                description: "Connectez-vous pour enregistrer vos favoris.",
                action: {
                    label: "Connexion",
                    onClick: () => router.visit(login()),
                },
            });
            return;
        }

        const previousState = isFavorited;
        const nextState = !previousState;
        setIsFavorited(nextState);

        router.post(
            products.favorite(product.slug).url,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
                onSuccess: () => {
                    toast.success(nextState ? "Ajouté aux favoris" : "Retiré des favoris", {
                        description: product.name,
                    });
                },
                onError: () => {
                    setIsFavorited(previousState);
                    toast.error("Impossible de mettre à jour les favoris");
                },
            }
        );
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock || adding) return;

        router.post(
            carts.store().url,
            {
                product_id: product.id,
                variant_id: defaultVariant?.id ?? null,
                quantity: 1,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onBefore: () => setAdding(true),
                onFinish: () => setAdding(false),
                onSuccess: () => {
                    setJustAdded(true);
                    setTimeout(() => setJustAdded(false), 2000);
                    toast.success("Produit ajouté !", {
                        description: `1x ${product.name}`,
                    });
                },
                onError: () => {
                    toast.error("Erreur lors de l'ajout au panier.");
                },
            }
        );
    };

    return (
        <motion.article
            variants={cardItemVariants}
            className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 ${isOutOfStock ? "opacity-85" : ""
                }`}
        >
            {/* Product Image Stage */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-cover object-center transition-transform duration-500 will-change-transform group-hover:scale-105 ${isOutOfStock ? "grayscale-[35%]" : ""
                        }`}
                    loading="lazy"
                />

                {/* Badges & Favorite Action */}
                <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-3 pointer-events-none">
                    <div className="flex flex-col gap-1.5 items-start">
                        {hasDiscount && (
                            <Badge className="border-none bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground shadow-sm">
                                -{discountPercentage}%
                            </Badge>
                        )}

                        {product.badge && (
                            <Badge className="border-none bg-primary/95 text-primary-foreground px-2 py-0.5 text-[11px] font-bold shadow-sm backdrop-blur-md">
                                {product.badge}
                            </Badge>
                        )}

                        {isOutOfStock && (
                            <Badge variant="destructive" className="px-2 py-0.5 text-[11px] font-bold shadow-sm">
                                Épuisé
                            </Badge>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={toggleFavorite}
                        aria-label={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                        className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background/85 shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95 ${isFavorited
                                ? "text-red-500 fill-red-500"
                                : "text-muted-foreground hover:text-red-500 hover:bg-background"
                            }`}
                    >
                        <Heart className={`h-4.5 w-4.5 ${isFavorited ? "fill-current" : ""}`} />
                    </button>
                </div>

                {/* Desktop Quick Add Bar */}
                {!isOutOfStock && settings?.show_price && (
                    <div className="absolute inset-x-0 bottom-0 z-20 hidden p-3 lg:block translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            type="button"
                            disabled={adding}
                            onClick={handleAddToCart}
                            className="h-10 w-full gap-2 rounded-xl bg-foreground text-background font-semibold shadow-lg hover:bg-primary hover:text-primary-foreground active:scale-95 transition-colors"
                        >
                            {adding ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : justAdded ? (
                                <>
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    <span>Ajouté !</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    <span>Ajout rapide</span>
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex-1 space-y-2">
                    {/* Category & Origin */}
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-primary tracking-wider uppercase text-[11px]">
                            {product.category || "Ferme"}
                        </span>

                        {product.origin && (
                            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground text-[11px]">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[90px]">{product.origin}</span>
                            </div>
                        )}
                    </div>

                    {/* Title & Clickable Card overlay */}
                    <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={products.show(product.slug)} className="focus:outline-hidden">
                            <span className="absolute inset-0 z-10" aria-hidden="true" />
                            {product.name}
                            {settings?.show_price && product.variant_name && (
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    ({product.variant_name})
                                </span>
                            )}
                        </Link>
                    </h3>
                </div>

                {/* Pricing & Mobile Action */}
                {settings?.show_price && (
                    <div className="mt-4 flex items-end justify-between border-t border-border/60 pt-3.5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Prix TTC
                            </span>

                            <div className="flex items-baseline gap-2 mt-0.5">
                                <div className="flex items-baseline gap-1">
                                    <span
                                        className={`text-xl sm:text-2xl font-black tracking-tight ${hasDiscount ? "text-destructive" : "text-foreground"
                                            }`}
                                    >
                                        {product.price.toLocaleString("fr-FR")}
                                    </span>
                                    <span
                                        className={`text-xs font-bold ${hasDiscount ? "text-destructive/80" : "text-muted-foreground"
                                            }`}
                                    >
                                        {product.currency}
                                    </span>
                                </div>

                                {hasDiscount && (
                                    <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                                        {product.compare_at_price?.toLocaleString("fr-FR")}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mobile Add-To-Cart Button */}
                        <div className="relative z-20 lg:hidden">
                            <Button
                                type="button"
                                size="icon"
                                disabled={isOutOfStock || adding}
                                onClick={handleAddToCart}
                                className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md active:scale-90 transition-transform disabled:opacity-50"
                                aria-label={`Ajouter ${product.name} au panier`}
                            >
                                {adding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : justAdded ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <ShoppingBasket className="h-4.5 w-4.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </motion.article>
    );
};
