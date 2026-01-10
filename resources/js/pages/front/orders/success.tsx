import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Check, Home, Package, ShoppingBag, Truck, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Order, Address } from "@/types";
import products from "@/routes/products";
import { orderDeliveryStatus } from "@/data";

interface PageProps {
    order: Order;
}

export default function OrderSuccess({ order }: PageProps) {
    const formatCurrency = useCurrencyFormatter();

    // Calcul des sous-totaux pour l'affichage
    const itemsTotal = order.items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    const shippingCost = Number(order.total) - itemsTotal;

    // Helper pour typer l'adresse qui peut être un Record<string,any> ou Address
    const shippingAddress = order.shipping_address as Address;

    return (
        <AppLayout layout="guest">
            <Head title={`Commande #${order.id} confirmée`} />

            <div className="bg-stone-50 min-h-screen py-10 lg:py-16">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

                    {/* En-tête de succès */}
                    <div className="text-center mb-10">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-6 animate-in zoom-in duration-500">
                            <Check className="h-10 w-10 text-green-600" strokeWidth={3} />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl mb-2">
                            Merci, commande confirmée !
                        </h1>
                        <p className="text-lg text-stone-600">
                            Votre commande <span className="font-bold text-stone-900">#{order.id}</span> a bien été enregistrée.
                        </p>
                        <p className="text-sm text-stone-500 mt-2">
                            Un email de confirmation vient d'être envoyé à l'adresse associée à votre compte.
                        </p>
                    </div>

                    <Card className="shadow-none border-stone-200 overflow-hidden mb-4 sm:mb-8">
                        <CardHeader className="bg-stone-50/50 border-b border-stone-100 px-4 sm:px-6 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-sm text-stone-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>Effectuée le {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide">
                                        {orderDeliveryStatus.find(s => s.value === order.status) ? `${orderDeliveryStatus.find(s => s.value === order.status)?.label}` : 'En attente de validation'}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {/* Liste des produits */}
                            <ul className="divide-y divide-stone-100">
                                {order.items.map((item) => (
                                    <li key={item.id} className="flex p-4 sm:p-6 hover:bg-stone-50/30 transition-colors">

                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-white">
                                            {/* Fallback si product ou default_image est null */}
                                            <img
                                                src={item.image || item.product?.default_image || `https://placehold.co/150?text=${item.product?.name || 'PR'}`}
                                                alt={item.product?.name || 'Produit'}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <div className="ml-4 flex flex-1 flex-col">
                                            <div>
                                                <div className="flex justify-between text-base font-medium text-stone-900">
                                                    <h3 className="line-clamp-1">
                                                        <Link href={item.product ? products.show(item.product?.slug) : '#'} className="hover:underline">
                                                            {item.product?.name || "Produit inconnu"}
                                                        </Link>
                                                    </h3>
                                                    <p className="ml-4">{formatCurrency(item.total || (Number(item.price) * item.quantity))}</p>
                                                </div>
                                                {/* Affichage des variantes basé sur VariantOption[] */}
                                                {item.variant && item.variant.length > 0 && (
                                                    <p className="mt-1 text-sm text-stone-500">
                                                        {item.variant.map(o => o.option).join(' / ')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-1 items-end justify-between text-sm">
                                                <p className="text-stone-500">Qté {item.quantity}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Totaux */}
                            <div className="bg-stone-50/50 p-4 sm:p-6 border-t border-stone-100 space-y-3">
                                <div className="flex justify-between text-sm text-stone-600">
                                    <p>Sous-total</p>
                                    <p className="font-medium">{formatCurrency(itemsTotal)}</p>
                                </div>
                                <div className="flex justify-between text-sm text-stone-600">
                                    <p className="flex items-center gap-2">
                                        <Truck className="h-4 w-4" />
                                        Livraison {order.carrier ? `(${order.carrier.name})` : ''}
                                    </p>
                                    <p className="font-medium">
                                        {shippingCost <= 0 ? "Offert" : formatCurrency(shippingCost)}
                                    </p>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-base font-bold text-stone-900">
                                    <p>Total payé</p>
                                    <p className="text-primary text-xl">{formatCurrency(order.total)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bloc Adresse de livraison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {shippingAddress && (
                            <Card className="shadow-none border-stone-200">
                                <CardHeader className="px-4 sm:px-6 py-2">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Package className="h-5 w-5 text-stone-400" />
                                        Adresse de livraison
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 text-sm text-stone-600 space-y-1">
                                    <p className="font-semibold text-stone-900">
                                        {shippingAddress.firstname} {shippingAddress.lastname}
                                    </p>
                                    <p>{shippingAddress.address}</p>
                                    <p>{shippingAddress.city}</p>
                                    {shippingAddress.phone && (
                                        <p className="mt-2 text-stone-500 flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                            {shippingAddress.phone}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="shadow-none border-stone-200 bg-primary/5 border-primary/10">
                            <CardHeader className="px-4 sm:px-6 py-2">
                                <CardTitle className="text-base flex items-center gap-2 text-primary-900">
                                    <Truck className="h-5 w-5 text-primary" />
                                    Suivi de commande
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 text-sm text-primary-900/80">
                                <p className="mb-4">
                                    Votre commande est en cours de préparation. Vous serez notifié par SMS et/ou E-mail à chaque étape.
                                </p>
                                <div className="flex items-center gap-2 text-xs font-medium bg-white/50 p-2 rounded border border-primary/10">
                                    <span className="animate-pulse h-2 w-2 rounded-full bg-amber-500"></span>
                                    Statut actuel : {orderDeliveryStatus.find(s => s.value === order.status) ? `${orderDeliveryStatus.find(s => s.value === order.status)?.label}` : 'En attente de validation'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-stone-300 hover:bg-stone-50 text-stone-700">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Retour à l'accueil
                            </Link>
                        </Button>
                        <Button asChild size="lg" className="w-full sm:w-auto shadow-md shadow-primary/20">
                            <Link href={products.index()}>
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Continuer mes achats
                                <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
