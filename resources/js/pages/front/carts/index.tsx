import { Button } from "@/components/ui/button";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import AppLayout from "@/layouts/app-layout";
import { SharedData } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import routeProducts from '@/routes/products';
import carts from "@/routes/carts";

export default function CartIndex() {
    const { cart } = usePage<SharedData>().props;

    const formatCurrency = useCurrencyFormatter();

    const updateQuantity = (itemId: number, newQty: number) => {
        if (newQty < 1) return;

        // Assurez-vous d'avoir une route définie pour la mise à jour
        router.patch(carts.items.update(itemId), { quantity: newQty }, {
            preserveScroll: true,
            only: ['cart']
        });
    };

    const removeItem = (itemId: number) => {
        // Assurez-vous d'avoir une route définie pour la suppression
        router.delete(carts.items.destroy(itemId), {
            preserveScroll: true,
            only: ['cart']
        });
    };

    const cartHasItems = cart && cart.items && cart.items.length > 0;

    return (
        <AppLayout layout="guest">
            <Head title="Mon Panier" />
            <div className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900">Mon Panier</h1>

                    <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                        {/* Liste des articles */}
                        <section aria-labelledby="cart-heading" className="lg:col-span-7">
                            <h2 id="cart-heading" className="sr-only">Articles dans votre panier</h2>

                            {cartHasItems ? (
                                <ul role="list" className="divide-y divide-stone-200 border-t border-b border-stone-200">
                                    {cart.items.map((item) => (
                                        <li key={item.id} className="flex py-6 sm:py-10">
                                            {/* Image */}
                                            <div className="shrink-0">
                                                <img
                                                    src={item.image || item.product?.default_image || `https://placehold.co/128?text=${encodeURIComponent(item?.product?.name || 'Produit')}`}
                                                    alt={item.name || 'Produit'}
                                                    className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32 border border-stone-200"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                    <div>
                                                        <div className="flex justify-between">
                                                            <h3 className="text-sm">
                                                                <Link
                                                                    href={item.product ? routeProducts.show(item.product.slug) : '#'}
                                                                    className="font-medium text-stone-700 hover:text-stone-800"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                            </h3>
                                                        </div>
                                                        <div className="mt-1 flex text-sm">
                                                            <p className="text-stone-500">
                                                                {item.variant ? item.variant.map(v => v.option).join(' / ') : (item.product?.origin || 'Standard')}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-sm font-medium text-stone-900">
                                                            {formatCurrency(item.price)}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 sm:mt-0 sm:pr-9">
                                                        {/* Quantité */}
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>

                                                        {/* Supprimer */}
                                                        <div className="absolute top-0 right-0">
                                                            <button
                                                                type="button"
                                                                className="-m-2 inline-flex p-2 text-stone-400 hover:text-red-500 transition-colors"
                                                                onClick={() => removeItem(item.id)}
                                                            >
                                                                <span className="sr-only">Supprimer</span>
                                                                <Trash2 className="h-5 w-5" aria-hidden="true" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-between items-end">
                                                    <p className="flex space-x-2 text-sm text-stone-700">
                                                        <span>Total : </span>
                                                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-lg">
                                    <ShoppingBag className="mx-auto h-12 w-12 text-stone-400" />
                                    <h3 className="mt-4 text-lg font-medium text-stone-900">Votre panier est vide</h3>
                                    <p className="mt-2 text-stone-500">Découvrez nos produits frais et ajoutez-les à votre panier.</p>
                                    <div className="mt-8">
                                        <Button asChild size="lg">
                                            <Link href={routeProducts.index()}>Continuer vos achats</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Récapitulatif de commande */}
                        {cartHasItems && (
                            <section
                                aria-labelledby="summary-heading"
                                className="mt-16 rounded-lg bg-stone-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 border border-stone-100 shadow-sm"
                            >
                                <h2 id="summary-heading" className="text-lg font-medium text-stone-900">
                                    Récapitulatif
                                </h2>

                                <dl className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-stone-600">Sous-total</dt>
                                        <dd className="text-sm font-medium text-stone-900">{formatCurrency(cart.subtotal)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                                        <dt className="text-base font-bold text-stone-900">Total</dt>
                                        <dd className="text-base font-bold text-primary">
                                            {formatCurrency(cart.subtotal)}
                                        </dd>
                                    </div>
                                    <p className="text-xs text-stone-500 italic mt-2">
                                        Les frais de livraison seront calculés à l'étape suivante.
                                    </p>
                                </dl>

                                <div className="mt-6">
                                    <Button className="w-full" size="lg" asChild>
                                        {/* Remplacez par votre route de checkout */}
                                        <Link href="#">
                                            Passer la commande
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
