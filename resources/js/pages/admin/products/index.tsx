import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginationMeta, Product, Variant } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, Plus, Download, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { dateTimeFormatOptions } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { useEventBus } from '@/context/event-bus-context';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import ProductsLayout from '@/layouts/products/layout';
import { productStatus } from '@/data';
import { useCurrencyFormatter } from '@/hooks/use-currency';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: 'Produits', href: '#' },
]

interface PageProps {
    products: {
        data: Product[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    }
}

export default function Index({ products, filters }: PageProps) {
    const { on, clearLast } = useEventBus();

    const formatPrice = useCurrencyFormatter();

    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const toggleSort = (column: keyof Product) => {
        let dir: "asc" | "desc" | "" = "asc"
        if (sort === column) dir = "desc"
        else if (sort === "-" + column) dir = ""
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column)
        setSort(newSort);
        applyFilters({ sort: newSort })
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(admin.products.index().url, {
            search,
            sort,
            per_page: perPage,
            page: products.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleDelete = (product: Product) => {
        setDeleteProduct(product);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteProduct(null);
            setIsDialogOpen(true);
        }
    };

    const handleExport = () => {
        const headers = ['Nom', "Date de création"];
        const rows = products.data.map(u => [
            u.name,
            u.created_at
        ]);
        const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "products_export.csv");
        link.click();
    };

    const columns = useMemo<ColumnDef<Product>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected()
                            ? true
                            : table.getIsSomePageRowsSelected()
                                ? "indeterminate"
                                : false
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("name")}>
                    Nom <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const variants = row.original.variants ?? [];

                if (variants.length > 0) {
                    const defaultVariant = variants.find(v => v.is_default);
                    const variantToUse = defaultVariant ?? variants[0];

                    const variantName = variantToUse.options
                        .map(o => `${o.attribute}: ${o.option}`)
                        .join(" / ");

                    return (
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{row.original.name}</span>
                            <span className="text-sm text-gray-500 mt-1">{variantName}</span>
                        </div>
                    );
                }

                return <span className="font-medium text-gray-900">{row.original.name}</span>;
            },
        },
        {
            accessorKey: "base_price",
            header: 'Prix',
            cell: ({ row }) => {
                const variants = row.original.variants ?? [];

                if (variants.length > 0) {
                    const defaultVariant = variants.find(v => v.is_default);

                    const variantToUse = defaultVariant ?? variants[0];

                    return formatPrice(Number(variantToUse.price));
                }

                return formatPrice(Number(row.original.base_price));
            },
        },
        {
            accessorKey: "variants",
            header: 'Variantes',
            cell: ({ row }) => (row.original.variants ?? []).length,
        },
        {
            accessorKey: "status",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("status")}>
                    Statut <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.original.status;
                let colorClass = "bg-muted text-muted-foreground";
                switch (status) {
                    case "published": colorClass = "bg-green-100 text-green-800"; break;
                    case "archived": colorClass = "bg-red-100 text-red-800"; break;
                    case "draft": colorClass = "bg-yellow-100 text-yellow-800"; break;
                }
                return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                    {productStatus.find(s => s.value === status)?.label}
                </span>;
            },
        },
        {
            accessorKey: "created_at",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("created_at")}>
                    Créé le <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return date.toLocaleString("fr-FR", dateTimeFormatOptions);
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.visit(admin.products.edit(row.original.slug).url)}>
                            <Edit className="mr-1 h-4 w-4" /> Éditer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTimeout(() => handleDelete(row.original), 100)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: products.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
    });

    const handleRowSelectionChange = (updaterOrValue: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>)) => {
        const newValue = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection) : updaterOrValue;
        setRowSelection(newValue);
    };

    useEffect(() => {
        const offProductSaved = on('product.saved', (message) => {
            toast.success(
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Succès</span>
                    <span className="text-sm text-muted-foreground">{message}</span>
                </div>);
        }, { replay: true, once: true });

        return () => {
            offProductSaved();
            clearLast?.('product.saved');
        }
    }, [on]);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Produits" />
            <ProductsLayout>
                <div className="space-y-6 md:mt-[-77px]">
                    {/* Header */}
                    <div className="flex justify-end flex-wrap">
                        <Button
                            variant="outline"
                            className="ml-2"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" /> Exporter les produits
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => router.visit(admin.products.create().url)}
                        >
                            <Plus className="h-4 w-4" /> Ajouter un produit
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Produits</h1>
                            <p className="text-sm text-muted-foreground">Gérez les produits et les variantes.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className='relative'>
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={isMobile ? "Rechercher..." : "Rechercher un utilisateur..."}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && applyFilters({ page: 1 })}
                                    className="px-8 flex-1 md:w-[260px] text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent"
                                />
                            </div>
                            {Object.keys(rowSelection).length > 0 && (
                                <Button variant="destructive" onClick={handleBulkDelete}>
                                    <Trash2 className="mr-1 h-4 w-4" /> Supprimer {Object.keys(rowSelection).length}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <DataTable<Product>
                        data={products.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucun produit trouvé."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={products.meta}
                        perPage={perPage}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            applyFilters({ per_page: val, page: 1 });
                        }}
                    />
                </div>
            </ProductsLayout>
            {/* AlertDialog */}
            <ConfirmDeleteDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Confirmer la suppression"
                message={deleteProduct
                    ? `Voulez-vous vraiment supprimer ${deleteProduct.name} ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} produit(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteProduct ? [deleteProduct.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        admin.products.destroy().url,
                        { ids },
                        {
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Succès</span>
                                        <span className="text-sm text-muted-foreground">
                                            Les produits sélectionnés ont été supprimés.
                                        </span>
                                    </div>
                                );
                            },
                            onError: (errors: any) => {
                                const messages: string[] = [];

                                // Check if errors.errors exists and is an object
                                if (errors.errors && typeof errors.errors === 'object') {
                                    for (const key of Object.keys(errors.errors)) {
                                        const fieldErrors = errors.errors[key];
                                        if (Array.isArray(fieldErrors)) {
                                            messages.push(...fieldErrors);
                                        }
                                    }
                                } else if (errors.error) {
                                    messages.push(errors.error);
                                } else {
                                    messages.push("Une erreur est survenue lors de la suppression.");
                                }

                                toast.error(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Erreur</span>
                                        <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
                                            {messages.map((msg, index) => (
                                                <li key={index}>{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            },
                        }
                    );
                    setRowSelection({});
                    setDeleteProduct(null);
                    setIsDialogOpen(false);
                }}
            />
        </AppLayout >
    );
}
