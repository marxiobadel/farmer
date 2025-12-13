import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginationMeta, Product, StockMovement, VariantOption } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, MoreHorizontal, Download, Search, Package, ArrowRightLeft, TrendingUp, TrendingDown, AlertCircle, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { movementTypeLabels, movementTypeStyles } from '@/data';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, inputClassNames } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: 'Mouvements de stock', href: '#' },
]

interface PageProps {
    products: Product[];
    movements: {
        data: StockMovement[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        type?: string;
        sort?: string;
        per_page?: number;
    };
    types: string[]; // List of available types from controller
}

export default function InventoryIndex({ movements, filters, types, products }: PageProps) {
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [typeFilter, setTypeFilter] = useState<string>(filters.type ?? "all");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);

    const [openProduct, setOpenProduct] = useState(false);
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        product_id: "",
        variant_id: "",
        quantity: "",
        type: "correction",
        note: ""
    });

    const selectedProduct = useMemo(() => {
        return products.find(p => String(p.id) === data.product_id);
    }, [data.product_id, products]);

    const toggleSort = (column: keyof StockMovement) => {
        let dir: "asc" | "desc" | "" = "asc"
        if (sort === column) dir = "desc"
        else if (sort === "-" + column) dir = ""
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column)
        setSort(newSort);
        applyFilters({ sort: newSort })
    }

    const applyFilters = (newFilters: any) => {
        router.get(admin.inventory.index().url, {
            search,
            type: typeFilter === "all" ? null : typeFilter,
            sort,
            per_page: perPage,
            page: movements.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true, except: ['products'] });
    }

    const handleExport = () => {
        // Simple CSV export logic for current view
        const headers = ["Date", "Produit", "Type", "Quantité", "Avant", "Après", "Note", "Utilisateur"];
        const rows = movements.data.map(m => [
            m.created_at,
            `${m.product.name} ${m.variant ? `(${m.variant.name})` : ''}`,
            m.type,
            m.quantity,
            m.stock_before,
            m.stock_after,
            m.note || '',
            m.user?.name || 'Système'
        ]);
        const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `stock_movements_${new Date().toISOString().slice(0, 10)}.csv`);
        link.click();
    };

    const handleAdjustmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.inventory.store().url, {
            onSuccess: () => {
                setIsAdjustmentOpen(false);
                reset();
                toast.success("Stock ajusté avec succès");
            },
            onError: () => {
                toast.error("Erreur lors de l'ajustement");
            }
        });
    };

    const columns = useMemo<ColumnDef<StockMovement>[]>(() => [
        {
            accessorKey: "created_at",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("created_at")} className="-ml-4">
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{date.toLocaleDateString("fr-FR")}</span>
                        <span className="text-xs text-muted-foreground">{date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: "product",
            header: "Produit / Variante",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {row.original.product?.image ? (
                            <img src={row.original.product?.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-sm text-gray-900 line-clamp-1">
                            {row.original.product?.name}
                        </div>
                        {row.original.variant && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                    {row.original.variant.sku}
                                </span>
                                {row.original.variant.name}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.original.type;
                return (
                    <Badge variant="outline" className={`${movementTypeStyles[type] || 'bg-gray-100'} border shadow-none font-medium capitalize`}>
                        {movementTypeLabels[type] || type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "quantity",
            header: () => <div className="text-right">Quantité</div>,
            cell: ({ row }) => {
                const qty = row.original.quantity;
                const isPositive = qty > 0;
                return (
                    <div className={`flex items-center justify-end font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {qty > 0 ? '+' : ''}{qty}
                    </div>
                );
            },
        },
        {
            accessorKey: "stock_after",
            header: () => <div className="text-right">Stock Final</div>,
            cell: ({ row }) => (
                <div className="text-right font-mono text-xs text-muted-foreground">
                    {row.original.stock_after}
                </div>
            ),
        },
        {
            accessorKey: "user",
            header: "Auteur",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {row.original.user?.name?.[0] || "S"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">{row.original.user?.name || 'Système'}</span>
                </div>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {/* Note: No delete action for stock movements to preserve audit trail */}
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(row.original.id))}>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Copier ID Mouvement
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], [sort]);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Mouvements de stock" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Mouvements de Stock</h1>
                            <p className="text-sm text-muted-foreground">
                                Historique complet des entrées et sorties de stock.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Exporter
                            </Button>
                            {/* Link to manual adjustment page if you have one */}
                            <Button onClick={() => setIsAdjustmentOpen(true)}>
                                <ArrowRightLeft className="h-4 w-4 mr-2" />
                                Ajustement Manuel
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex justify-end flex-1 flex-col sm:flex-row gap-3 w-full">
                        <div className='relative w-full sm:w-[300px]'>
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher produit, user, note..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applyFilters({ page: 1 })}
                                className={cn('pl-8', inputClassNames())}
                            />
                        </div>

                        <Select
                            value={typeFilter}
                            onValueChange={(val) => {
                                setTypeFilter(val);
                                // We need to pass the new value directly because setTypeFilter is async
                                applyFilters({ type: val === "all" ? null : val, page: 1 });
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Type de mouvement" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les types</SelectItem>
                                {types.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${movementTypeStyles[t]?.split(' ')[0] || 'bg-gray-400'}`} />
                                            {movementTypeLabels[t] || t}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DataTable<StockMovement>
                        data={movements.data}
                        columns={columns}
                        emptyMessage="Aucun mouvement de stock trouvé."
                    />
                    {/* Pagination */}
                    <DataTablePagination
                        meta={movements.meta}
                        perPage={perPage}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            applyFilters({ per_page: val, page: 1 });
                        }}
                    />
                </div>
            </div>
            {/* --- Manual Adjustment Dialog --- */}
            <Dialog open={isAdjustmentOpen} onOpenChange={(open) => {
                if (!open) {
                    reset();
                    clearErrors();
                }
                setIsAdjustmentOpen(open);
            }}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ajustement de stock manuel</DialogTitle>
                        <DialogDescription>
                            Ajoutez ou retirez du stock manuellement pour corriger des erreurs ou des pertes.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAdjustmentSubmit} className="space-y-4">

                        {/* 1. Product Select */}
                        <div className="grid gap-2">
                            <Label htmlFor="product">Produit</Label>
                            {products.length > 0 ? (
                                <Popover open={openProduct} onOpenChange={setOpenProduct}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openProduct}
                                            className="w-full justify-between"
                                        >
                                            {data.product_id
                                                ? products.find((p) => String(p.id) === data.product_id)?.name
                                                : "Sélectionner un produit..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Rechercher un produit..." />
                                            <CommandList>
                                                <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                                <CommandGroup>
                                                    {products.map((p) => (
                                                        <CommandItem
                                                            key={p.id}
                                                            value={p.name}
                                                            onSelect={() => {
                                                                setData(prev => ({
                                                                    ...prev,
                                                                    product_id: String(p.id),
                                                                    variant_id: ""
                                                                }));
                                                                setOpenProduct(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    data.product_id === String(p.id)
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {p.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <div className="text-sm text-muted-foreground italic border p-2 rounded">
                                    Erreur: Liste de produits non disponible
                                </div>
                            )}
                            {errors.product_id && <span className="text-sm text-destructive">{errors.product_id}</span>}
                        </div>

                        {/* 2. Variant Select (Conditional) */}
                        {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="variant">Variante</Label>
                                <Select
                                    value={data.variant_id}
                                    onValueChange={(val) => setData('variant_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une variante..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {selectedProduct.variants.map((v) => (
                                            <SelectItem key={v.id} value={String(v.id)}>
                                                {v.options.map((o: VariantOption) => o.option).join(" / ")} ({v.sku})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.variant_id && <span className="text-sm text-destructive">{errors.variant_id}</span>}
                            </div>
                        )}

                        {/* 3. Type & Quantity Row */}
                        <div className="grid grid-cols-2 gap-4 items-start">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(val) => setData('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="correction">Correction</SelectItem>
                                        <SelectItem value="restock">Réapprovisionnement</SelectItem>
                                        <SelectItem value="return">Retour Client</SelectItem>
                                        <SelectItem value="destruction">Perte / Destruction</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <span className="text-sm text-destructive">{errors.type}</span>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantité</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 5 ou -2"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    className={inputClassNames()}
                                />
                                <span className="text-[12px] text-muted-foreground">
                                    Utilisez "-" pour retirer du stock.
                                </span>
                                {errors.quantity && <span className="text-sm text-destructive">{errors.quantity}</span>}
                            </div>
                        </div>

                        {/* 4. Note */}
                        <div className="grid gap-2">
                            <Label htmlFor="note">Note (Optionnel)</Label>
                            <Textarea
                                placeholder="Raison de l'ajustement..."
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className={inputClassNames()}
                            />
                            {errors.note && <span className="text-sm text-destructive">{errors.note}</span>}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAdjustmentOpen(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
