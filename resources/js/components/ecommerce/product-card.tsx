import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/ecommerce";
import { motion } from "framer-motion";
import { Heart, MapPin, Plus, ShoppingBasket } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    // Suppression du useState qui cause des re-rendus inutiles

    return (
        <motion.div
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/50 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/20"
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            // Optimisation 2 : L'animation se déclenche quand l'élément entre de 50px dans l'écran
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    // Optimisation 3 : Une courbe "easeOut" est plus naturelle pour l'œil humain
                    transition: { duration: 0.5, ease: "easeOut" }
                }
            }}
        >
            {/* --- Zone Image --- */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                <div className="h-full w-full">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                    />
                </div>

                {/* Overlay Haut (Badges + Wishlist) */}
                <div className="absolute inset-x-0 top-0 flex justify-between p-3 z-10">
                    <div className="flex flex-col gap-1.5">
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
                        className="group/heart flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-stone-400 backdrop-blur-md transition-all hover:bg-white hover:text-red-500 hover:scale-110 active:scale-95"
                        aria-label="Ajouter aux favoris"
                    >
                        <Heart className="h-5 w-5 transition-transform group-hover/heart:fill-current" />
                    </button>
                </div>

                {/* Quick Add Button (Slide Up Interaction via Variants) */}
                {product.isAvailable && (
                    <motion.div
                        className="absolute inset-x-0 bottom-0 p-4 z-20"
                        // L'animation est pilotée par le "whileHover" du parent
                        variants={{
                            hidden: { y: "100%", opacity: 0 }, // État par défaut (caché)
                            visible: { y: "100%", opacity: 0 }, // Reste caché lors de l'apparition de la carte
                            hover: { y: 0, opacity: 1 }         // Apparaît au survol
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Button
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
                    {/* Méta-données */}
                    <div className="flex items-center justify-between text-xs font-medium text-stone-500">
                        <span className="uppercase tracking-wider text-primary/80 font-bold">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-md">
                            <MapPin className="h-3 w-3 text-stone-400" />
                            <span className="truncate max-w-[80px]">{product.origin}</span>
                        </div>
                    </div>

                    {/* Titre */}
                    <h3 className="text-lg font-bold text-stone-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {/* z-0 sur le lien pour ne pas bloquer le clic du bouton Ajout Rapide (z-20) */}
                        <a href={`/produits/${product.id}`} className="focus:outline-none">
                            <span className="absolute inset-0 z-0" aria-hidden="true" />
                            {product.name}
                        </a>
                    </h3>
                </div>

                {/* Prix et Action Mobile */}
                <div className="mt-5 flex items-end justify-between border-t border-stone-100 pt-4">
                    <div>
                        <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wide mb-0.5">Prix TTC</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-stone-900 tracking-tight">
                                {product.price.toLocaleString("fr-FR")}
                            </span>
                            <span className="text-sm font-bold text-stone-500">{product.currency}</span>
                        </div>
                    </div>

                    {/* Fallback Icon pour Mobile (visible uniquement si pas de hover souris) */}
                    <div className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900">
                        <ShoppingBasket className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
