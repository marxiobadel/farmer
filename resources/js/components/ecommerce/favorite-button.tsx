import { Heart } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import type { SharedData, Product } from "@/types";
import products from "@/routes/products";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
    product: Product;
}

export default function FavoriteButton({ product }: FavoriteButtonProps) {
    const { props } = usePage<SharedData>();
    const isFavorited = props.isFavorited as boolean;

    const toggleFavorite = () => {
        router.post(
            products.favorite(product.slug).url,
            {},
            {
                preserveScroll: true,
                showProgress: false,
                async: true,
                only: ["isFavorited"],
                onBefore: () => {
                    router.replaceProp("isFavorited", !props.isFavorited);
                },
                onSuccess: (page) => {
                    if (props.auth.user) {
                        toast.success("Succès", {
                            description: page.props.isFavorited
                                ? "Ce produit est ajouté dans vos favoris."
                                : "Ce produit est retiré de vos favoris.",
                        });
                    } else {
                        toast.warning("Avertissement", {
                            description: "Vous devez être connecté pour réaliser une telle action.",
                        });
                    }
                },
                onError: (err) => {
                    console.error("Favorite error:", err);
                    router.replaceProp("isFavorited", props.isFavorited);
                },
            }
        );
    };

    return (
        <button
            onClick={toggleFavorite}
            className={cn(`text-stone-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-stone-100`,
            {'text-red-500': isFavorited})}>
            <Heart className={`w-6 h-6 ${isFavorited ? "fill-red-500" : "fill-none"}`} />
        </button>
    );
}
