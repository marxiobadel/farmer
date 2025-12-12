import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DollarSign,
    Users,
    ShoppingBag,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Calendar as CalendarIcon,
    Download
} from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import admin from "@/routes/admin";
import { generateImage } from "@/lib/utils";
import { orderDeliveryStatus } from "@/data";

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, description, className }: any) => (
    <Card className={className + ' shadow-none'}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center text-xs mt-1">
                {trend !== undefined && (
                    <span className={`flex items-center font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(trend)}%
                    </span>
                )}
                <span className="text-muted-foreground ml-2 truncate">
                    {description}
                </span>
            </div>
        </CardContent>
    </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border text-popover-foreground shadow-md rounded-lg p-3 text-sm">
                <p className="font-semibold mb-1">{new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="text-primary font-medium">
                    Ventes: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

export default function Dashboard({ stats }: { stats: any }) {
    const formatCurrency = useCurrencyFormatter();

    return (
        <AppLayout breadcrumbs={[{ title: "Tableau de bord", href: "#" }]}>
            <Head title="Tableau de bord" />

            <div id="dashboard-capture" className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 pt-6">

                {/* Header Actions (Pro feel) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold tracking-tight">Vue d'ensemble</h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Ce mois
                        </Button>
                        <Button size="sm" type="button" onClick={generateImage}>
                            <Download className="mr-2 h-4 w-4" />
                            Rapport
                        </Button>
                    </div>
                </div>

                {/* 1. Key Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Revenu Total"
                        value={formatCurrency(stats.financials.revenue)}
                        icon={DollarSign}
                        trend={stats.financials.revenue_growth}
                        description="vs mois dernier"
                    />
                    <StatCard
                        title="Commandes"
                        value={stats.financials.orders}
                        icon={ShoppingBag}
                        trend={stats.financials.orders_growth}
                        description="vs mois dernier"
                    />
                    <StatCard
                        title="Clients Actifs"
                        value={stats.users.customers}
                        icon={Users}
                        description="Total clients"
                    />
                    <StatCard
                        title="Alertes Stock"
                        value={stats.inventory.low_stock}
                        icon={AlertTriangle}
                        description="Produits < 5 unités"
                        className="border-amber-200 bg-amber-50/50"
                    />
                </div>

                {/* Main Content Split */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                    {/* 2. Chart Section */}
                    <Card className="col-span-4 shadow-none">
                        <CardHeader>
                            <CardTitle>Aperçu des ventes</CardTitle>
                            <CardDescription>
                                Revenus quotidiens sur les 30 derniers jours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.charts.sales_over_time} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={10}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value / 1000}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                        <Bar
                                            dataKey="total"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                            barSize={30}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Recent Orders List */}
                    <Card className="col-span-3 shadow-none flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Commandes Récentes</CardTitle>
                                <CardDescription>
                                    Les 5 dernières transactions.
                                </CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="gap-1">
                                <Link href={admin.orders.index().url}>
                                    Voir tout <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-6">
                                {stats.recent_orders.map((order: any) => (
                                    <div className="flex items-center justify-between" key={order.id}>
                                        <div className="flex items-center gap-4">
                                            {/* Avatar with Initials */}
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${order.user.firstname} ${order.user.lastname}`} alt="Avatar" />
                                                <AvatarFallback>{order.user.firstname[0]}{order.user.lastname[0]}</AvatarFallback>
                                            </Avatar>

                                            <div className="grid gap-1">
                                                <p className="text-sm font-medium leading-none truncate w-[120px] sm:w-auto">
                                                    {order.user.firstname} {order.user.lastname}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate w-[120px] sm:w-auto">
                                                    {order.user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <div className="font-bold text-sm">
                                                +{formatCurrency(order.total)}
                                            </div>
                                            {/* Simple Status Dot */}
                                            <div className="flex items-center gap-1.5">
                                                 <span className={`relative flex h-2 w-2`}>
                                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${order.status === 'completed' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${order.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                </span>
                                                <span className="text-[10px] text-muted-foreground capitalize">
                                                    {orderDeliveryStatus.find(s => s.value === order.status)?.label || order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
