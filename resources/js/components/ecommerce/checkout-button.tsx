import { Link, usePage } from "@inertiajs/react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedData } from "@/types";
import { cn } from "@/lib/utils";
import orders from "@/routes/orders";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { useIsMobile } from "@/hooks/use-mobile";

export default function CheckoutButton() {
    const isMobile = useIsMobile();
    const { props } = usePage<SharedData>();
    const { cart } = props;

    const formatPrice = useCurrencyFormatter();

    // Vérification de sécurité
    const hasItems = cart && cart.total_qty > 0;
    const cartTotal = cart?.subtotal || 0;

    return (
        <Button
            className={cn(
                "w-full relative overflow-hidden transition-all duration-300",
                hasItems ? "shadow-lg shadow-primary/20 hover:shadow-primary/30" : "opacity-80"
            )}
            size="lg"
            disabled={!hasItems}
            asChild={hasItems}
        >
            {hasItems ? (
                // Cas : Panier avec articles -> Lien actif
                <Link href={orders.create()} className="flex items-center justify-between px-6">
                    <span className="font-bold tracking-wide">Passer la commande</span>

                    {!isMobile && (
                    <div className="flex items-center gap-3">
                        <span className="hidden opacity-40 sm:inline-block">|</span>
                        <span className="font-mono font-medium tracking-tight bg-white/10 px-2 py-0.5 rounded text-sm">
                            {formatPrice(cartTotal)}
                        </span>
                        <ArrowRight className="ml-0.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>)}
                </Link>
            ) : (
                // Cas : Panier vide -> Bouton inactif (span)
                <span className="flex items-center justify-center gap-2 cursor-not-allowed">
                    <ShoppingBag className="h-4 w-4 opacity-50" />
                    <span>Votre panier est vide</span>
                </span>
            )}
        </Button>
    );
}
