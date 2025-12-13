import AppLayout from "@/layouts/app-layout";
import { StockMovement } from "@/types";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft,
    Calendar,
    Package,
    TrendingUp,
    TrendingDown,
    FileText,
    ExternalLink,
    Copy,
    Check,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { movementTypeLabels, movementTypeStyles } from "@/data";
import admin from "@/routes/admin";
import { useState } from "react";
import { toast } from "sonner";

interface PageProps {
    movement: StockMovement;
}

export default function InventoryShow({ movement }: PageProps) {
    const isPositive = movement.quantity > 0;
    const date = new Date(movement.created_at);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(String(movement.id));
        setCopied(true);
        toast.success("ID copié dans le presse-papier");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: "Mouvements de stock", href: admin.inventory.index().url },
            { title: `Détail #${movement.id}`, href: '#' }
        ]}>
            <Head title={`Mouvement #${movement.id}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-4">

                {/* --- Header Section --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Button variant="outline" size="icon" className="shrink-0" asChild>
                            <Link href={admin.inventory.index().url}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Mouvement de Stock
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={`text-sm px-2.5 py-0.5 border-0 font-medium capitalize ${movementTypeStyles[movement.type] || 'bg-gray-100'}`}
                                >
                                    {movementTypeLabels[movement.type] || movement.type}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {date.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span>•</span>
                                <span>{date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors" onClick={copyToClipboard}>
                                    <span className="font-mono">#{movement.id}</span>
                                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* --- LEFT COLUMN (2/3) --- */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* 1. Stock Flow Visualization (The "Math") */}
                        <Card className="overflow-hidden border-1 shadow-none">
                            <CardHeader className="bg-muted/10 pb-4">
                                <CardTitle className="text-base font-medium text-muted-foreground">Flux de quantité</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 px-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    {/* Before */}
                                    <div className="text-center w-full sm:w-1/3 p-4 rounded-lg bg-background border border-dashed">
                                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Stock Initial</div>
                                        <div className="text-3xl font-mono text-muted-foreground">{movement.stock_before}</div>
                                    </div>

                                    {/* The Action Arrow */}
                                    <div className="flex flex-col items-center justify-center shrink-0 relative px-4">
                                        <div className={`
                                            flex items-center justify-center h-12 w-12 rounded-full mb-2 shadow-sm
                                            ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                                        `}>
                                            {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                                        </div>
                                        <Badge variant={isPositive ? 'default' : 'destructive'} className="text-base px-3 py-1 font-mono">
                                            {isPositive ? '+' : ''}{movement.quantity}
                                        </Badge>
                                        <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-muted-foreground/20 -z-10 hidden sm:block scale-150" />
                                    </div>

                                    {/* After */}
                                    <div className="text-center w-full sm:w-1/3 p-4 rounded-lg bg-secondary/50 border border-secondary">
                                        <div className="text-xs uppercase tracking-wider text-foreground font-semibold mb-1">Stock Final</div>
                                        <div className="text-3xl font-bold font-mono text-foreground">{movement.stock_after}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Product Details */}
                        <Card className="shadow-none border-1">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    Détails du Produit
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="h-32 w-32 shrink-0 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden">
                                        {movement.product?.image ? (
                                            <img src={movement.product.image} className="h-full w-full object-cover" alt={movement.product?.name} />
                                        ) : (
                                            <Package className="h-10 w-10 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-foreground">{movement.product?.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                    ID: {movement.product ? movement.product.id : 'Inconnu'}
                                                </Badge>
                                                {movement.variant && (
                                                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                                                        SKU: {movement.variant.sku}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Variante</p>
                                                <p className="text-sm font-medium">
                                                    {movement.variant ? movement.variant.name : <span className="italic text-muted-foreground">Produit standard</span>}
                                                </p>
                                            </div>
                                            {movement.product &&
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">Actions</p>
                                                <Button variant="link" className="p-0 h-auto text-primary" asChild>
                                                    <Link href={admin.products.edit(movement.product.slug).url}>
                                                        Ouvrir la fiche produit <ExternalLink className="h-3 w-3 ml-1" />
                                                    </Link>
                                                </Button>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- RIGHT COLUMN (1/3) --- */}
                    <div className="space-y-4">

                        {/* 3. Context & Audit */}
                        <Card className="h-full flex flex-col shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base">Contexte</CardTitle>
                                <CardDescription>Informations d'audit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-1 px-4">

                                {/* User */}
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-9 w-9 mt-0.5">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                            {movement.user?.name?.substring(0, 2).toUpperCase() || "SY"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium leading-none">
                                            {movement.user ? "Opérateur" : "Automatique"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {movement.user?.name || "Système"}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Reference (Order, etc) */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <ExternalLink className="h-4 w-4" /> Source
                                    </div>
                                    {movement.reference ? (
                                        <div className="bg-muted/40 rounded-md p-3 border">
                                            <p className="text-sm font-medium text-foreground">{movement.reference.label}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic pl-6">Aucun document lié</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Note */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <FileText className="h-4 w-4" /> Note / Raison
                                    </div>
                                    <div className="text-sm leading-relaxed text-foreground/90 bg-yellow-50/50 p-3 rounded-md border border-yellow-100">
                                        {movement.note || <span className="italic text-muted-foreground opacity-70">Aucune note spécifiée.</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
