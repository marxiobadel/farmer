import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import { BreadcrumbItem, Order } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import {
    Calendar,
    CreditCard,
    Download,
    Mail,
    MapPin,
    MoreHorizontal,
    MoreVertical,
    Package,
    Phone,
    Printer,
    Truck,
    Tag, // Ajout de l'icône Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { colorMap, orderDeliveryStatus, paymentStatus, pricingTypes } from "@/data";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn, getPaymentStatusColor, inputClassNames } from "@/lib/utils";

interface PageProps {
    order: Order;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des commandes", href: admin.orders.index().url },
    { title: "Détails de commande", href: '#' },
];

export default function Show({ order }: PageProps) {
    const isMobile = useIsMobile();
    const formatCurrency = useCurrencyFormatter();

    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    const { data, setData, patch, processing, reset } = useForm({
        status: order.status,
    });

    // --- CALCULS ---
    // 1. Total des articles
    const itemsTotal = order.items.reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);

    // 2. Remise
    const discount = Number(order.discount || 0);

    // 3. Frais de port : Total - (Produits - Remise)
    // Si Total = Produits - Remise + Port => Port = Total - Produits + Remise
    const shippingCost = Number(order.total) - itemsTotal + discount;

    const handleStatusUpdate = () => {
        patch(admin.orders.updateStatus(order.id).url, {
            onSuccess: () => setIsStatusDialogOpen(false),
        });
    };

    const handlePaymentStatusChange = (paymentId: number, newStatus: string) => {
        router.patch(admin.payments.updateStatus(paymentId).url, {
            status: newStatus
        }, {
            preserveScroll: true
        });
    };

    const statusLabel = orderDeliveryStatus.find(s => s.value === order.status)?.label || order.status;

    const statusColorClass = colorMap[order.status] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title={`Commande #${order.id}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">

                {/* --- Header Section --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Commande #{order.id}
                            </h1>
                            <Badge
                                className={`uppercase text-xs font-bold border shadow-none ${statusColorClass}`}
                            >
                                {statusLabel}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Passée le {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            {/* Utilisez un lien direct pour forcer le téléchargement sans passer par Inertia */}
                            <a href={admin.orders.invoice(order.id).url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Facture
                            </a>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsStatusDialogOpen(true)}>Modifier le statut</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* --- Left Column (Main Content) --- */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* 1. Products List */}
                        <Card className="shadow-none py-4">
                            <CardHeader className="border-b bg-muted/20 pb-4 px-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Package className="h-5 w-5 text-gray-500" />
                                    Articles commandés
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3">Produit</th>
                                                <th className="px-4 py-3 text-right">Prix</th>
                                                <th className="px-4 py-3 text-center">Qté</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {order.items.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50/50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            {/* Placeholder for Image */}
                                                            <div className="h-10 w-10 rounded bg-gray-100 border flex-shrink-0 flex items-center justify-center text-gray-400">
                                                                <Package className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{item.product?.name}</div>
                                                                {item.variant && (
                                                                    <div className="text-xs text-gray-500">
                                                                        Variante: {item.variant.map((o: any) => o.option).join(" / ")}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right whitespace-nowrap">
                                                        {formatCurrency(item.price)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="p-4 text-right font-medium whitespace-nowrap">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Order Summary within the card */}
                                <div className="p-4 bg-gray-50/50 border-t flex flex-col items-end space-y-2">
                                    <div className="w-full sm:w-1/2 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Sous-total</span>
                                            <span>{formatCurrency(itemsTotal)}</span>
                                        </div>

                                        {/* Affichage du coupon */}
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span className="flex items-center gap-2">
                                                    <Tag className="h-4 w-4" />
                                                    Remise {order.coupon_code ? `(${order.coupon_code})` : ''}
                                                </span>
                                                <span>- {formatCurrency(discount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Livraison ({order.carrier?.name})</span>
                                            <span>{formatCurrency(Math.max(0, shippingCost))}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                                            <span>Total</span>
                                            <span>{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Payment History */}
                        <Card className="shadow-none py-4">
                            <CardHeader className="border-b bg-muted/20 pb-4 px-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-gray-500" />
                                    Paiements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3">Référence</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Méthode</th>
                                                <th className="px-4 py-3">Montant</th>
                                                <th className="px-4 py-3">Statut</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {order.payments && order.payments.length > 0 ? (
                                                order.payments.map((payment) => (
                                                    <tr key={payment.id} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4 font-mono text-sm text-gray-600">
                                                            {payment.reference}
                                                            {payment.transaction_id && (
                                                                <div className="text-[10px] text-gray-400 truncate max-w-[100px]" title={payment.transaction_id}>
                                                                    {payment.transaction_id}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            {payment.created_at ? format(new Date(payment.created_at), "d MMM yyyy", { locale: fr }) : "-"}
                                                        </td>
                                                        <td className="p-4 capitalize">
                                                            <div className="flex items-center gap-2">
                                                                {/* Icône simple selon la méthode */}
                                                                {payment.method === 'cash' ? (
                                                                    <Badge variant="outline" className="text-xs font-normal">Espèce</Badge>
                                                                ) : (
                                                                    <span className="font-medium text-gray-700">{payment.method}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 font-medium">
                                                            {formatCurrency(payment.amount)}
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge variant="outline" className={getPaymentStatusColor(payment.status)}>
                                                                {payment.status === 'completed' ? 'Payé' :
                                                                    payment.status === 'pending' ? 'En attente' :
                                                                        payment.status === 'failed' ? 'Échoué' : payment.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {/* Menu d'actions pour chaque ligne */}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                                        Changer le statut
                                                                    </div>
                                                                    <DropdownMenuItem onClick={() => handlePaymentStatusChange(payment.id, 'completed')}>
                                                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                                                        Marquer comme Payé
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handlePaymentStatusChange(payment.id, 'pending')}>
                                                                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                                                        Marquer En attente
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handlePaymentStatusChange(payment.id, 'failed')}>
                                                                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                                                                        Marquer comme Échoué
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handlePaymentStatusChange(payment.id, 'refunded')}>
                                                                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                                                                        Marquer Remboursé
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                        Aucun paiement enregistré.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Right Column (Sidebar) --- */}
                    <div className="space-y-4">

                        {/* 3. Customer Details */}
                        <Card className="shadow-none py-4">
                            <CardHeader className="px-4">
                                <CardTitle className="text-base">Client</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {order.user?.firstname?.[0]}{order.user?.lastname?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium">{order.user?.firstname} {order.user?.lastname}</div>
                                        <div className="text-xs text-muted-foreground">ID: {order.user?.id}</div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <a href={`mailto:${order.user?.email}`} className="hover:text-primary transition-colors">
                                            {order.user?.email}
                                        </a>
                                    </div>
                                    {order.user?.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <a href={`tel:${order.user?.phone}`} className="hover:text-primary transition-colors">
                                                {order.user?.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Carrier / Shipping Info */}
                        <Card className="shadow-none py-4">
                            <CardHeader className="px-4">
                                <CardTitle className="text-base">Livraison</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                                        <Truck className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{order.carrier?.name || "Non assigné"}</div>
                                        <div className="text-xs text-muted-foreground">Transporteur</div>
                                    </div>
                                </div>
                                {order.carrier_id && (
                                    <div className="text-xs bg-gray-50 p-2 rounded border text-gray-600">
                                        Type: {pricingTypes.find(p => p.value === order.carrier?.pricing_type)?.label || 'Standard'}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 5. Addresses */}
                        <Card className="shadow-none py-4">
                            <CardHeader className="px-4">
                                <CardTitle className="text-base">Adresses</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4">
                                {/* Shipping Address */}
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Expédition
                                    </div>
                                    {order.shipping_address ? (
                                        <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                            <span className="font-medium text-gray-900 block">
                                                {order.shipping_address.firstname} {order.shipping_address.lastname}
                                            </span>
                                            {order.shipping_address.address}<br />
                                            {order.shipping_address?.city}, {order.shipping_address?.postal_code}<br />
                                            {order.shipping_address?.phone}
                                        </address>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Aucune adresse d'expédition</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Billing Address */}
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Facturation
                                    </div>
                                    {order.invoice_address ? (
                                        <address className="not-italic text-sm text-gray-600 leading-relaxed">
                                            <span className="font-medium text-gray-900 block">
                                                {order.invoice_address.firstname} {order.invoice_address.lastname}
                                            </span>
                                            {order.invoice_address.address}<br />
                                            {order.invoice_address?.city}, {order.invoice_address?.postal_code}<br />
                                            {order.invoice_address?.phone}
                                        </address>
                                    ) : (
                                        <p className="text-sm text-gray-500">Identique à l'expédition</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {/* --- MODALE DE CHANGEMENT DE STATUT --- */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifier le statut de la commande</DialogTitle>
                        <DialogDescription>
                            Changez l'état d'avancement de la commande #{order.id}.
                            Le client pourra voir ce changement.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Statut
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={data.status}
                                    onValueChange={(val) => setData('status', val)}
                                >
                                    <SelectTrigger className={cn('w-full', inputClassNames())}>
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {orderDeliveryStatus.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                <div className="flex items-center gap-2">
                                                    {/* Petit indicateur de couleur dans la liste */}
                                                    <div className={`w-2 h-2 rounded-full ${colorMap[status.value]?.split(' ')[0] || 'bg-gray-200'}`} />
                                                    {status.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsStatusDialogOpen(false)}
                            disabled={processing}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleStatusUpdate}
                            disabled={processing}
                        >
                            {processing ? "Mise à jour..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
