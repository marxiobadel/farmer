import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, router } from "@inertiajs/react";
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import products from "@/routes/products";
import carts from "@/routes/carts";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Cart } from "@/types";

type CartSheetProps = {
    cart: Cart;
};

export const CartSheet = ({ cart }: CartSheetProps) => {
    const formatCurrency = useCurrencyFormatter();

    const cartItems = cart?.items || [];
    const cartTotal = cart?.subtotal || 0;
    const itemsCount = cartItems.length;

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
                <Button variant="outline" size="icon" className="relative border-stone-200 hover:border-primary text-stone-700 hover:bg-primary/10 hover:text-primary mr-1">
                    <ShoppingBasket className="h-5 w-5" />
                    {itemsCount > 0 && (
                        <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground p-0 text-[10px]">
                            {itemsCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
                <SheetHeader className="px-4 py-4 border-b flex flex-row items-center justify-between space-y-0">
                    <SheetTitle className="text-lg font-semibold">Mon Panier ({itemsCount})</SheetTitle>
                    {/* Le bouton de fermeture est géré automatiquement par SheetContent, mais on peut le styliser si besoin */}
                </SheetHeader>

                {/* LISTE DES PRODUITS */}
                <ScrollArea className="flex-1 px-4 max-h-[calc(100vh)] overflow-y-auto">
                    {itemsCount > 0 ? (
                        <div className="flex flex-col gap-6 py-6">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    {/* Image */}
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-50">
                                        <img
                                            src={item.image || item.product?.default_image || `https://placehold.co/80?text=${encodeURIComponent(item?.product?.name || 'Produit')}`}
                                            alt={item.name || 'Produit'}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Détails */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="grid gap-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-stone-900 leading-none">
                                                    <Link href={item.product ? products.show(item.product.slug) : '#'} className="hover:underline">
                                                        {item.name}
                                                    </Link>
                                                </h3>
                                                <p className="font-bold text-stone-900">
                                                    {formatCurrency(item.total)}
                                                </p>
                                            </div>

                                            {/* Affichage conditionnel de la VARIANTE */}
                                            {item.variant && item.variant.length > 0 ? (
                                                <p className="text-sm text-stone-500">
                                                    Variante: <span className="font-medium text-stone-700">{item.variant.map(v => v.option).join(' / ')}</span>
                                                </p>
                                            ) : (
                                                <p className="text-sm text-stone-400 italic">Standard</p>
                                            )}
                                        </div>

                                        {/* Contrôles Quantité & Suppression */}
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center border border-stone-200 rounded-md h-8">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="px-2 hover:bg-stone-100 h-full text-stone-600 disabled:opacity-50 transition-colors"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="px-2 text-xs font-medium min-w-[1.5rem] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 hover:bg-stone-100 h-full text-stone-600 transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium hover:underline transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-stone-500">
                            <ShoppingBasket className="h-12 w-12 mb-4 opacity-20" />
                            <p>Votre panier est vide</p>
                        </div>
                    )}
                </ScrollArea>

                {/* FOOTER PANIER */}
                {itemsCount > 0 && (
                    <div className="border-t bg-stone-50 p-4 space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-base font-medium text-stone-900">
                                <span>Sous-total</span>
                                <span>{formatCurrency(cartTotal)}</span>
                            </div>
                            <p className="text-xs text-stone-500">
                                Frais de livraison calculés à l'étape suivante.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Button className="w-full h-11 text-base font-semibold shadow-md" asChild>
                                <Link href={carts.index()}>
                                    Voir mon panier
                                </Link>
                            </Button>
                            <SheetClose asChild>
                                <Button onClick={() => router.visit(products.index())} variant="outline" className="w-full h-11 border-stone-200">
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
