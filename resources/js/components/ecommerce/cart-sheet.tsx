import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, router } from "@inertiajs/react";
import { ShoppingBasket, Minus, Plus, Trash2, ArrowRight, Truck } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import type { Cart } from "@/types";
import carts from "@/routes/carts";
import products from "@/routes/products";

interface CartSheetProps {
    cart: Cart;
    totalCount: number;
}

const FREE_SHIPPING_THRESHOLD = 25000; // Free shipping target amount

export const CartSheet = ({ cart, totalCount }: CartSheetProps) => {
    const formatCurrency = useCurrencyFormatter();
    const items = cart?.items || [];
    const subtotal = cart?.subtotal || 0;
    const progressToFreeShipping = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

    const updateQuantity = (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        router.patch(
            carts.items.update(itemId),
            { quantity: newQty },
            { preserveScroll: true, only: ["cart"] }
        );
    };

    const removeItem = (itemId: number) => {
        router.delete(carts.items.destroy(itemId), {
            preserveScroll: true,
            only: ["cart"],
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative h-9 w-9 rounded-full border-border bg-card/60 text-foreground hover:border-primary/50 hover:text-primary transition-all shadow-xs"
                    aria-label="Voir le panier"
                >
                    <ShoppingBasket className="h-4.5 w-4.5" />
                    {totalCount > 0 && (
                        <Badge className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground border-2 border-background">
                            {totalCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md border-border bg-card">
                {/* Header */}
                <SheetHeader className="border-b border-border px-5 py-4 text-left">
                    <SheetTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                        <ShoppingBasket className="h-5 w-5 text-primary" />
                        Mon Panier
                        <span className="text-xs font-normal text-muted-foreground">
                            ({totalCount} {totalCount > 1 ? "articles" : "article"})
                        </span>
                    </SheetTitle>
                </SheetHeader>

                {/* Free Shipping Progress bar */}
                {items.length > 0 && (
                    <div className="bg-muted/40 border-b border-border/60 px-5 py-2.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-1.5">
                            <Truck className="h-3.5 w-3.5 text-primary" />
                            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                                <span className="text-emerald-600 font-bold">Livraison offerte sur cette commande !</span>
                            ) : (
                                <span>
                                    Plus que <strong className="text-primary">{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> pour la livraison offerte
                                </span>
                            )}
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                            <div
                                className="h-full bg-primary transition-all duration-300 rounded-full"
                                style={{ width: `${progressToFreeShipping}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Items List */}
                <ScrollArea className="flex-1 px-5">
                    {items.length > 0 ? (
                        <div className="divide-y divide-border/60">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3.5 py-4">
                                    <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                                        <img
                                            src={
                                                item.image ||
                                                item.product?.default_image ||
                                                `https://placehold.co/80?text=${encodeURIComponent(item?.name || "Produit")}`
                                            }
                                            alt={item.name ?? ''}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-semibold text-foreground leading-tight">
                                                    {item.product ? (
                                                        <Link href={products.show(item.product.slug)} className="hover:text-primary">
                                                            {item.name}
                                                        </Link>
                                                    ) : (
                                                        item.name
                                                    )}
                                                </h4>
                                                <span className="text-sm font-bold text-foreground shrink-0">
                                                    {formatCurrency(item.total)}
                                                </span>
                                            </div>

                                            {item.variant && item.variant.length > 0 ? (
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {item.variant.map((v) => v.option).join(" / ")}
                                                </p>
                                            ) : (
                                                <p className="mt-0.5 text-xs text-muted-foreground/60 italic">Standard</p>
                                            )}
                                        </div>

                                        {/* Stepper + Remove */}
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center rounded-lg border border-border bg-background">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                    aria-label="Diminuer la quantité"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-7 text-center text-xs font-semibold text-foreground">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                                                    aria-label="Augmenter la quantité"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span>Supprimer</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                                <ShoppingBasket className="h-8 w-8" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Votre panier est vide</h3>
                            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                                Découvrez nos œufs frais du jour et volailles élevées en plein air.
                            </p>
                            <SheetClose asChild>
                                <Button asChild size="sm" className="mt-5 rounded-full px-5">
                                    <Link href={products.index().url}>Découvrir nos produits</Link>
                                </Button>
                            </SheetClose>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-border bg-card p-5 space-y-3">
                        <div className="flex justify-between items-baseline text-base font-semibold text-foreground">
                            <span>Sous-total</span>
                            <span className="text-lg font-bold text-primary">{formatCurrency(subtotal)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Frais de port et réductions calculés lors du paiement.
                        </p>
                        <div className="grid gap-2 pt-1">
                            <Button asChild className="h-11 w-full rounded-full bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:opacity-95">
                                <Link href={carts.index()}>
                                    Commander
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <SheetClose asChild>
                                <Button variant="ghost" className="h-10 w-full rounded-full text-xs font-medium text-muted-foreground">
                                    Continuer mes achats
                                </Button>
                            </SheetClose>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
