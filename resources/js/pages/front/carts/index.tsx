import CheckoutButton from "@/components/ecommerce/checkout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import ajouté
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { useFlashNotifications } from "@/hooks/use-flash-notification";
import AppLayout from "@/layouts/app-layout";
import { inputClassNames } from "@/lib/utils";
import carts from "@/routes/carts";
import routeProducts from '@/routes/products';
import { SharedData } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react"; // Icones ajoutées
import { useState } from "react"; // Hook ajouté
import { toast } from "sonner";

export default function CartIndex() {
    // On suppose que l'objet cart contient maintenant 'coupon', 'discount_amount' et 'total'
    // grâce à la mise à jour du CartResource côté backend.
    const { cart } = usePage<SharedData>().props;

    const formatCurrency = useCurrencyFormatter();
    const [couponCode, setCouponCode] = useState("");
    const [loadingCoupon, setLoadingCoupon] = useState(false);

    const updateQuantity = (itemId: number, newQty: number) => {
        if (newQty < 1) return;

        router.patch(carts.items.update(itemId), { quantity: newQty }, {
            preserveScroll: true,
            only: ['cart']
        });
    };

    const removeItem = (itemId: number) => {
        router.delete(carts.items.destroy(itemId), {
            preserveScroll: true,
            only: ['cart']
        });
    };

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode) return;

        setLoadingCoupon(true);
        router.post(carts.coupon.apply(), { code: couponCode }, {
            preserveScroll: true,
            onFinish: () => setLoadingCoupon(false),
            onSuccess: () => setCouponCode(""),
            onError: (error) => {
                if (error.coupon) {
                    toast.error('Erreur !', { description: error.coupon});
                }
            }
        });
    };

    const handleRemoveCoupon = () => {
        router.delete(carts.coupon.remove(), {
            preserveScroll: true,
        });
    };

    const cartHasItems = cart && cart.items && cart.items.length > 0;

    useFlashNotifications();

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

                                <div className="mt-6 space-y-4">
                                    <dl className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <dt className="text-sm text-stone-600">Sous-total</dt>
                                            <dd className="text-sm font-medium text-stone-900">{formatCurrency(cart.subtotal)}</dd>
                                        </div>

                                        {/* Section Coupon - Affichage dynamique */}
                                        <div className="border-t border-b border-stone-200 py-4">
                                            {cart.coupon ? (
                                                <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                                                    <div className="flex items-center space-x-2 overflow-hidden">
                                                        <Tag className="h-4 w-4 text-green-600 shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-green-700 font-medium truncate" title={cart.coupon.code}>
                                                                {cart.coupon.code}
                                                            </span>
                                                            <span className="text-xs text-green-600">
                                                                Code appliqué
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleRemoveCoupon}
                                                        className="ml-2 text-stone-400 hover:text-red-500 p-1 hover:bg-white rounded-full transition-colors"
                                                        title="Retirer le code promo"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                                    <Input
                                                        placeholder="Code promo"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        className={inputClassNames('bg-white')}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={loadingCoupon || !couponCode}
                                                        className="shrink-0"
                                                    >
                                                        Appliquer
                                                    </Button>
                                                </form>
                                            )}
                                        </div>

                                        {/* Affichage de la remise si elle existe */}
                                        {cart.discount_amount > 0 && (
                                            <div className="flex items-center justify-between text-green-700">
                                                <dt className="text-sm flex items-center">
                                                    Remise
                                                </dt>
                                                <dd className="text-sm font-medium">
                                                    - {formatCurrency(cart.discount_amount)}
                                                </dd>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                                            <dt className="text-base font-bold text-stone-900">Total</dt>
                                            <dd className="text-base font-bold text-primary">
                                                {/* Utilisation de cart.total calculé par le backend */}
                                                {formatCurrency(cart.total)}
                                            </dd>
                                        </div>
                                    </dl>

                                    <p className="text-xs text-stone-500 italic mt-2">
                                        Les frais de livraison seront calculés à l'étape suivante.
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <CheckoutButton />
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
