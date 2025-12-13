import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Order, PaginationMeta } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, Plus, Download, Search, Eye } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { dateTimeFormatOptions, formatName } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { useEventBus } from '@/context/event-bus-context';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { colorMap, orderDeliveryStatus } from '@/data';
import { useCurrencyFormatter } from '@/hooks/use-currency';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: 'Commandes', href: '#' },
]

interface PageProps {
    orders: {
        data: Order[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    }
}

export default function Index({ orders, filters }: PageProps) {
    const { on, clearLast } = useEventBus();

    const formatPrice = useCurrencyFormatter();

    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteOrder, setDeleteOrder] = useState<Order | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const toggleSort = (column: keyof Order) => {
        let dir: "asc" | "desc" | "" = "asc"
        if (sort === column) dir = "desc"
        else if (sort === "-" + column) dir = ""
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column)
        setSort(newSort);
        applyFilters({ sort: newSort })
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(admin.orders.index().url, {
            search,
            sort,
            per_page: perPage,
            page: orders.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleDelete = (order: Order) => {
        setDeleteOrder(order);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteOrder(null);
            setIsDialogOpen(true);
        }
    };

    const handleExport = () => {
        const headers = ["Date de création"];
        const rows = orders.data.map(u => [
            u.created_at
        ]);
        const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "orders_export.csv");
        link.click();
    };

    const columns = useMemo<ColumnDef<Order>[]>(() => [
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
            accessorKey: "user_id",
            header: () => 'Client',
            cell: ({ row }) => {
                return <span className="font-medium text-gray-900">{formatName(row.original.user?.fullname)}</span>;
            },
        },
        {
            accessorKey: "total",
            header: 'Total',
            cell: ({ row }) => {
                return formatPrice(Number(row.original.total));
            },
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

                const colorClass = colorMap[status] ?? "bg-muted text-muted-foreground";

                const label = orderDeliveryStatus.find(s => s.value === status)?.label ?? status;

                return (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                        {label}
                    </span>
                );
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
                        <DropdownMenuItem onClick={() => router.visit(admin.orders.show(row.original.id).url)}>
                            <Eye className="mr-1 h-4 w-4" /> Voir
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
        data: orders.data,
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
        const offOrderSaved = on('order.saved', (message) => {
            toast.success(
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Succès</span>
                    <span className="text-sm text-muted-foreground">{message}</span>
                </div>);
        }, { replay: true, once: true });

        return () => {
            offOrderSaved();
            clearLast?.('order.saved');
        }
    }, [on]);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Commandes" />
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-end flex-wrap">
                        <Button
                            variant="outline"
                            className="ml-2"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" /> Exporter les commandes
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => router.visit(admin.orders.create().url)}
                        >
                            <Plus className="h-4 w-4" /> Ajouter une commande
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
                            <p className="text-sm text-muted-foreground">Gérez les commandes et les clients.</p>
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
                    <DataTable<Order>
                        data={orders.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucun commande trouvé."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={orders.meta}
                        perPage={perPage}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            applyFilters({ per_page: val, page: 1 });
                        }}
                    />
                </div>
            </div>
            {/* AlertDialog */}
            <ConfirmDeleteDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Confirmer la suppression"
                message={deleteOrder
                    ? `Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} commande(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteOrder ? [deleteOrder.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        admin.orders.destroy().url,
                        { ids },
                        {
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Succès</span>
                                        <span className="text-sm text-muted-foreground">
                                            Les commandes sélectionnées ont été supprimées.
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
                    setDeleteOrder(null);
                    setIsDialogOpen(false);
                }}
            />
        </AppLayout>
    );
}
