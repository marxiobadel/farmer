import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Order, PaginationMeta } from "@/types";
import ProfileLayout from "@/layouts/profile/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, Box, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import StatusBadge from "@/components/ecommerce/status-badge";
import profile from "@/routes/profile";
import products from "@/routes/products";

// Interface pour la réponse paginée (à adapter selon votre structure exacte)
interface OrdersProps {
    orders: {
        data: Order[];
        meta: PaginationMeta;
        links: any[];
    };
}

export default function Orders({ orders }: OrdersProps) {
    const formatCurrency = useCurrencyFormatter();

    return (
        <AppLayout layout="guest">
            <Head title="Mes commandes" />

            <ProfileLayout>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-stone-900">Historique des commandes</h2>
                        <p className="text-stone-500 text-sm">Consultez et suivez vos achats récents.</p>
                    </div>

                    <Card className="border-stone-200/60 shadow-none bg-white overflow-hidden">
                        {orders.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-stone-500 uppercase bg-stone-50/80 border-b border-stone-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold tracking-wider">Référence</th>
                                                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                                                <th className="px-6 py-4 font-semibold tracking-wider">Statut</th>
                                                <th className="px-6 py-4 font-semibold tracking-wider">Montant</th>
                                                <th className="px-6 py-4 text-right font-semibold tracking-wider">Détails</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {orders.data.map((order) => (
                                                <tr key={order.id} className="group hover:bg-stone-50/60 transition-colors cursor-pointer">
                                                    <td className="px-6 py-4 font-medium text-stone-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <Box className="h-4 w-4" />
                                                            </div>
                                                            #{order.id.toString().padStart(6, '0')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-stone-500">
                                                        <div className="w-max flex items-center gap-2">
                                                            <Clock className="h-3.5 w-3.5 text-stone-400" />
                                                            {format(new Date(order.created_at), "d MMM yyyy", { locale: fr })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={order.status} />
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-stone-900">
                                                        {formatCurrency(order.total)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-stone-400 hover:text-primary hover:bg-primary/5 rounded-full">
                                                            <Link href={profile.orders.show(order.id).url}>
                                                                <ChevronRight className="h-5 w-5" />
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                                    <Package className="h-8 w-8 text-stone-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-stone-900">Aucune commande trouvée</h3>
                                <p className="text-stone-500 max-w-sm mt-2 mb-6">
                                    Vous n'avez pas encore passé de commande. Découvrez nos produits frais dès maintenant.
                                </p>
                                <Button asChild>
                                    <Link href={products.index()}>
                                        Commencer vos achats
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Pagination simple si nécessaire */}
                    {orders.data.length > 0 && orders.meta && orders.meta.last_page > 1 && (
                        <div className="flex justify-center pt-4">
                            {/* Insérer ici votre composant de pagination si disponible, sinon des liens simples */}
                            <p className="text-xs text-stone-400">Affichage de {orders.data.length} sur {orders.meta.total} commandes</p>
                        </div>
                    )}
                </div>
            </ProfileLayout>
        </AppLayout>
    );
}
