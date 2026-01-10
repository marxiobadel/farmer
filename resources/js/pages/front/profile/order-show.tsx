import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Order, SharedData, Address } from "@/types";
import ProfileLayout from "@/layouts/profile/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    MapPin,
    CreditCard,
    Truck,
    Download,
    PackageCheck,
    CalendarClock
} from "lucide-react";
import { cn } from "@/lib/utils";
import profile from "@/routes/profile";
import StatusBadge from "@/components/ecommerce/status-badge";
import { contact } from "@/routes";

interface ShowProps {
    order: Order;
}

export default function Show({ order }: ShowProps) {
    const { auth } = usePage<SharedData>().props;
    const formatCurrency = useCurrencyFormatter();

    // Vérification du type d'adresse (peut être un objet Address ou un tableau/record selon votre structure)
    const shippingAddress = order.shipping_address as Address;
    const invoiceAddress = order.invoice_address as Address;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-stone-100 text-stone-800",
            processing: "bg-blue-100 text-blue-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-stone-100 text-stone-800";
    };

    return (
        <AppLayout layout="guest">
            <Head title={`Commande #${order.id}`} />

            <ProfileLayout>
                <div className="space-y-6">
                    {/* Navigation Retour */}
                    <div>
                        <Link
                            href={profile.orders().url}
                            className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors mb-4"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Retour à mes commandes
                        </Link>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:block">
                                <div className="flex items-center flex-col sm:flex-row gap-3 mb-3 sm:mb-1">
                                    <h2 className="text-2xl font-bold text-stone-900">
                                        Commande #{order.id.toString().padStart(6, '0')}
                                    </h2>
                                    <StatusBadge status={order.status} />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-stone-500 w-full sm:w-auto">
                                    <CalendarClock className="h-4 w-4" />
                                    <span>
                                        Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="border-stone-200">
                                    <Download className="h-4 w-4 mr-2" />
                                    Facture
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne Principale : Articles */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            <Card className="border-stone-200/60 shadow-none overflow-hidden">
                                <CardHeader className="px-4 sm:px-6 bg-stone-50/50 py-2">
                                    <CardTitle className="text-lg">Articles commandés</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-stone-100">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 p-4 sm:p-6 hover:bg-stone-50/30 transition-colors">
                                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                                                    {item.image || item.product?.default_image ? (
                                                        <img
                                                            src={item.image || item.product?.default_image || ''}
                                                            alt={item.product?.name}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-stone-400">
                                                            <PackageCheck className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <h3 className="text-base font-medium text-stone-900">
                                                                {item.product?.name || "Produit supprimé"}
                                                            </h3>
                                                            {/* Affichage des variantes si elles existent */}
                                                            {item.variant && Array.isArray(item.variant) && item.variant.length > 0 && (
                                                                <p className="mt-1 text-sm text-stone-500">
                                                                    {item.variant.map(v => `${v.attribute}: ${v.option}`).join(', ')}
                                                                </p>
                                                            )}
                                                            <p className="mt-1 text-sm text-stone-500">
                                                                Qté: {item.quantity} x {formatCurrency(item.price)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right sm:text-right">
                                                            <p className="font-semibold text-stone-900">
                                                                {formatCurrency(item.total)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Informations de paiement et livraison (Mobile/Tablette principalement) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <Card className="border-stone-200/60 shadow-none h-full">
                                    <CardHeader className="px-4 sm:px-6 py-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            Adresse de livraison
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 sm:px-6 text-sm text-stone-600 leading-relaxed">
                                        {shippingAddress ? (
                                            <>
                                                <p className="font-medium text-stone-900">{shippingAddress.firstname} {shippingAddress.lastname}</p>
                                                <p>{shippingAddress.address}</p>
                                                <p>{shippingAddress.postal_code} {shippingAddress.city}</p>
                                                <p>{shippingAddress.country?.name}</p>
                                                {shippingAddress.phone && <p className="mt-2">{shippingAddress.phone}</p>}
                                            </>
                                        ) : (
                                            <p className="italic text-stone-400">Adresse non disponible</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-stone-200/60 shadow-none h-full">
                                    <CardHeader className="px-4 sm:px-6 py-2">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-primary" />
                                            Paiement
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 sm:px-6 text-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-stone-500">Méthode</span>
                                            <span className="font-medium capitalize text-stone-900">
                                                {order.payments?.[0]?.method || "Non défini"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-500">Statut</span>
                                            <Badge variant="outline" className={order.payments?.[0]?.status === 'completed' ? 'text-green-700 bg-green-50 border-green-200' : 'text-stone-600'}>
                                                {order.payments?.[0]?.status || order.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Colonne Latérale : Résumé */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="border-stone-200/60 shadow-none sticky top-24">
                                <CardHeader className="px-4 sm:px-6 bg-stone-50/50 py-2">
                                    <CardTitle className="text-lg">Résumé</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 space-y-4 pt-4 sm:pt-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-500">Sous-total</span>
                                        <span className="font-medium text-stone-900">
                                            {/* Calcul approximatif si pas dispo dans l'objet order direct */}
                                            {formatCurrency(order.items.reduce((acc, item) => acc + item.total, 0))}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2 text-stone-500">
                                            <span>Livraison</span>
                                            {order.carrier && (
                                                <Badge
                                                    title={order.carrier.name}
                                                    variant="secondary"
                                                    className="text-[10px] h-5 px-1.5 font-normal max-w-[70px] truncate">
                                                    {order.carrier.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="font-medium text-stone-900">
                                            {/* Si frais de port séparés, sinon afficher inclus ou calcul */}
                                            {formatCurrency(order.total - order.items.reduce((acc, item) => acc + item.total, 0))}
                                        </span>
                                    </div>

                                    <Separator className="my-2" />

                                    <div className="flex justify-between text-base font-bold">
                                        <span className="text-stone-900">Total</span>
                                        <span className="text-primary">{formatCurrency(order.total)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-stone-50/30 text-xs text-stone-400 justify-center py-4">
                                    Tous les prix incluent la TVA applicable
                                </CardFooter>
                            </Card>

                            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
                                <Truck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-900">Besoin d'aide ?</h4>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Si vous avez un problème avec cette commande, contactez notre support client.
                                    </p>
                                    <Link
                                        href={contact()}
                                        className="text-xs font-medium text-blue-800 underline mt-2 block hover:text-blue-950"
                                    >
                                        Contacter le support
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </AppLayout>
    );
}
