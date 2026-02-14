import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginationMeta, Coupon } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, Plus, Search, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { dateTimeFormatOptions } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { useCurrencyFormatter } from '@/hooks/use-currency';
import CouponForm from './form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: "Codes coupons", href: '#' },
];

interface PageProps {
    coupons: {
        data: Coupon[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    }
}

export default function Index({ coupons, filters }: PageProps) {
    const formatPrice = useCurrencyFormatter();
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteCoupon, setDeleteCoupon] = useState<Coupon | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const [creatingCoupon, setCreatingCoupon] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const toggleSort = (column: keyof Coupon) => {
        let dir: "asc" | "desc" | "" = "asc";
        if (sort === column) dir = "desc";
        else if (sort === "-" + column) dir = "";
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column);
        setSort(newSort);
        applyFilters({ sort: newSort });
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(admin.coupons.index().url, {
            search,
            sort,
            per_page: perPage,
            page: coupons.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleEdit = (coupon: Coupon) => setEditingCoupon(coupon);

    const handleDelete = (coupon: Coupon) => {
        setDeleteCoupon(coupon);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteCoupon(null);
            setIsDialogOpen(true);
        }
    };

    const columns = useMemo<ColumnDef<Coupon>[]>(() => [
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
                />),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "code",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("code")}>
                    Code <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.code,
        },
        {
            accessorKey: "type",
            header: () => 'Type',
            cell: ({ row }) => {
                if (row.original.type === 'fixed') {
                    return 'Remise fixe';
                } else {
                    return 'Pourcentage'
                }
            },
        },
        {
            accessorKey: "value",
            header: 'Valeur de remise',
            cell: ({ row }) => {
                if (row.original.type === 'fixed') {
                    return formatPrice(row.original.value);
                } else {
                    return Number(row.original.value).toFixed(2) + '%'
                }
            },
        },
        {
            accessorKey: "expires_at",
            header: 'Expire le',
            cell: ({ row }) => {
                if (row.original.expires_at) {
                    const date = new Date(row.original.expires_at);
                    return date.toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    });
                } else {
                    return 'Jamais';
                }
            }
        },
        {
            accessorKey: 'is_active',
            header: "Approuvé",
            cell: ({ row }) => {
                if (row.original.is_active)
                    return <CheckCircle size={18} className={`text-green-600`} />
                else
                    return <CheckCircle size={18} />
            }
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
            accessorKey: "updated_at",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("updated_at")}>
                    Modifié le <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.original.updated_at);
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
                        <DropdownMenuItem onClick={() => setTimeout(() => handleEdit(row.original), 100)}>
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
        data: coupons.data,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coupons" />
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex justify-end flex-wrap">
                    <Button className="ml-2" onClick={() => setCreatingCoupon(true)}>
                        <Plus className="h-4 w-4" /> Créer un coupon
                    </Button>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Codes coupons</h1>
                        <p className="text-sm text-muted-foreground">Gérez les codes coupons de vos clients.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className='relative'>
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isMobile ? "Rechercher..." : "Rechercher un coupon..."}
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
                <DataTable<Coupon>
                    data={coupons.data}
                    columns={columns}
                    rowSelection={rowSelection}
                    onRowSelectionChange={handleRowSelectionChange}
                    emptyMessage="Aucun coupon trouvé."
                />

                {/* Pagination */}
                <DataTablePagination
                    meta={coupons.meta}
                    perPage={perPage}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(val) => {
                        setPerPage(val);
                        applyFilters({ per_page: val, page: 1 });
                    }}
                />
            </div>
            <CouponForm
                open={creatingCoupon || !!editingCoupon}
                onClose={() => {
                    setCreatingCoupon(false);
                    setEditingCoupon(null);
                }}
                coupon={editingCoupon}
                submitUrl={
                    editingCoupon
                        ? admin.coupons.update(editingCoupon.id).url
                        : admin.coupons.store().url
                }
                method={editingCoupon ? "PUT" : "POST"}
            />

            {/* AlertDialog */}
            <ConfirmDeleteDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Confirmer la suppression"
                message={deleteCoupon
                    ? `Voulez-vous vraiment supprimer ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} coupon(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteCoupon ? [deleteCoupon.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        admin.coupons.destroy().url, { ids },
                        {
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Succès</span>
                                        <span className="text-sm text-muted-foreground">
                                            Les témoignages sélectionnées ont été supprimées.
                                        </span>
                                    </div>
                                );
                            },
                            onError: (errors) => {
                                toast.error(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Erreur</span>
                                        <span className="text-sm text-muted-foreground">
                                            {errors.message ?? "Une erreur est survenue lors de la suppression."}
                                        </span>
                                    </div>
                                );
                            },
                        }
                    );
                    setRowSelection({});
                    setDeleteCoupon(null);
                    setIsDialogOpen(false);
                }}
            />
        </AppLayout >
    );
}
