import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Cart, PaginationMeta } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Trash2, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { dateTimeFormatOptions, formatName } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { useCurrencyFormatter } from '@/hooks/use-currency';
import { useFlashNotifications } from '@/hooks/use-flash-notification';
import ProductsLayout from '@/layouts/products/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: 'Paniers', href: '#' },
]

interface PageProps {
    carts: {
        data: Cart[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    }
}

export default function Index({ carts, filters }: PageProps) {
    const formatPrice = useCurrencyFormatter();

    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteCart, setDeleteCart] = useState<Cart | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const toggleSort = (column: keyof Cart) => {
        let dir: "asc" | "desc" | "" = "asc"
        if (sort === column) dir = "desc"
        else if (sort === "-" + column) dir = ""
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column)
        setSort(newSort);
        applyFilters({ sort: newSort })
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(admin.carts.index().url, {
            search,
            sort,
            per_page: perPage,
            page: carts.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleDelete = (cart: Cart) => {
        setDeleteCart(cart);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteCart(null);
            setIsDialogOpen(true);
        }
    };

    const columns = useMemo<ColumnDef<Cart>[]>(() => [
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
            accessorKey: "user",
            header: () => 'Client',
            cell: ({ row }) => {
                return <span className="font-medium text-gray-900">
                    {row.original.user ? formatName(row.original.user.fullname) : 'Invité'}
                </span>;
            },
        },
        {
            accessorKey: "total",
            header: 'Total',
            cell: ({ row }) => {
                return formatPrice(Number(row.original.subtotal));
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
                        <DropdownMenuItem onClick={() => setTimeout(() => handleDelete(row.original), 100)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: carts.data,
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

    useFlashNotifications();

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Commandes" />
            <ProductsLayout>
                <div className="space-y-6 md:mt-[-17px]">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Paniers</h1>
                            <p className="text-sm text-muted-foreground">Gérez les paniers et les clients.</p>
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
                    <DataTable<Cart>
                        data={carts.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucun panier trouvé."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={carts.meta}
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
                message={deleteCart
                    ? `Voulez-vous vraiment supprimer ce panier ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} panier(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteCart ? [deleteCart.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        admin.carts.destroy().url,
                        { ids },
                        {
                            preserveState: true,
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
                    setDeleteCart(null);
                    setIsDialogOpen(false);
                }}
            />

        </AppLayout>
    );
}
