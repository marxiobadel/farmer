import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Package, CreditCard, User, MapPin, ChevronRight, Clock, Box, TrendingUp, ShieldCheck, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Order, SharedData } from "@/types";
import products from "@/routes/products";
import ProfileLayout from "@/layouts/profile/layout";
import profile from "@/routes/profile";
import StatusBadge from "@/components/ecommerce/status-badge";

interface Stats {
    orders_count: number;
    total_spent: number;
}

interface PageProps {
    recentOrders: Order[];
    stats: Stats;
}

export default function ProfileDashboard({ recentOrders, stats }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const formatCurrency = useCurrencyFormatter();

    return (
        <AppLayout layout="guest">
            <Head title="Mon Compte" />
            <ProfileLayout>
                {/* Section Statistiques "Glassy" */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat: Commandes */}
                    <Card className="relative overflow-hidden border-stone-200/60 bg-white/60 shadow-none hover:shadow-sm transition-all duration-300 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <Package className="h-24 w-24 text-blue-600" />
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-stone-500">Commandes totales</p>
                                    <p className="text-2xl font-bold text-stone-900 mt-0.5">{stats.orders_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat: Dépenses */}
                    <Card className="relative overflow-hidden border-stone-200/60 bg-white/60 shadow-none hover:shadow-sm transition-all duration-300 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <TrendingUp className="h-24 w-24 text-emerald-600" />
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-stone-500">Total dépensé</p>
                                    <p className="text-2xl font-bold text-stone-900 mt-0.5">{formatCurrency(stats.total_spent)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stat: Adresses */}
                    <Card className="relative overflow-hidden border-stone-200/60 bg-white/60 shadow-none hover:shadow-sm transition-all duration-300 group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                            <MapPin className="h-24 w-24 text-amber-600" />
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-stone-500">Adresses enregistrées</p>
                                    <p className="text-2xl font-bold text-stone-900 mt-0.5">{auth.user.addresses?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dernières Commandes */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                            Commandes récentes
                        </h2>
                        <Link
                            href={profile.orders().url}
                            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 hover:underline underline-offset-4 transition-all"
                        >
                            Voir l'historique <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Card className="border-stone-200/60 shadow-none overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {recentOrders.length > 0 ? (
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
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="group hover:bg-stone-50/60 transition-colors cursor-pointer">
                                                    <td className="px-6 py-4 font-medium text-stone-900">
                                                        <div className="w-max flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                                <Box className="h-4 w-4" />
                                                            </div>
                                                            #{order.id.toString().padStart(6, '0')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-stone-500">
                                                        <div className="flex items-center gap-2">
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
                                <div className="py-16 text-center text-stone-500 flex flex-col items-center justify-center bg-stone-50/30">
                                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-stone-100">
                                        <Package className="h-8 w-8 text-stone-300" />
                                    </div>
                                    <h3 className="font-semibold text-stone-900 text-lg">Aucune commande</h3>
                                    <p className="mt-1 mb-8 text-sm max-w-xs mx-auto">Vous n'avez pas encore passé de commande. Explorez notre catalogue pour commencer.</p>
                                    <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/10">
                                        <Link href={products.index()}>Découvrir nos produits</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Grille d'infos supplémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Carte Profil Simplifiée */}
                    <Card className="border-stone-200/60 shadow-none bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Profil
                                </span>
                                <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-stone-500 hover:text-primary">
                                    <Link href={profile.edit().url}>Modifier</Link>
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50/50 border border-stone-100/50">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">E-mail</span>
                                        <span className="text-sm font-semibold text-stone-900 truncate max-w-[200px]">{auth.user.email}</span>
                                    </div>
                                    <ShieldCheck className={`h-4 w-4 text-${auth.user.email_verified_at === null ? 'red' : 'green'}-500`} />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50/50 border border-stone-100/50">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Téléphone</span>
                                        <span className="text-sm font-semibold text-stone-900">{auth.user.phone || 'Non renseigné'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carte Sécurité / Info */}
                    <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm mb-4">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Sécurité du compte</h3>
                            <p className="text-stone-300 text-sm leading-relaxed">
                                Votre compte est protégé. Nous recommandons de mettre à jour votre mot de passe régulièrement pour une sécurité optimale.
                            </p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <Link href={profile.password.edit().url} className="text-sm font-medium text-white hover:text-primary-foreground/80 flex items-center gap-2 transition-colors">
                                Gérer la sécurité <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </ProfileLayout>
        </AppLayout>
    );
}
