import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import DataTable from "@/components/datatable";
import DataTablePagination from "@/components/datatable-pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/layouts/app-layout";
import { dateTimeFormatOptions } from "@/lib/utils";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import { BreadcrumbItem, Contact, PaginationMeta } from "@/types";
import { Head, router } from "@inertiajs/react";
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: "Liste des contacts", href: '#' },
];

interface PageProps {
    contacts: {
        data: Contact[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    }
}

export default function Index({ contacts, filters }: PageProps) {
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const toggleSort = (column: keyof Contact) => {
        let dir: "asc" | "desc" | "" = "asc";
        if (sort === column) dir = "desc";
        else if (sort === "-" + column) dir = "";
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column);
        setSort(newSort);
        applyFilters({ sort: newSort });
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(admin.contacts.index().url, {
            search,
            sort,
            per_page: perPage,
            page: contacts.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleDelete = (contact: Contact) => {
        setDeleteContact(contact);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteContact(null);
            setIsDialogOpen(true);
        }
    };

    const columns = useMemo<ColumnDef<Contact>[]>(() => [
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
            accessorKey: "name",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("name")}>
                    Nom <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.name,
        },
        {
            accessorKey: "email",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("email")}>
                    E-mail <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.email,
        },
        {
            accessorKey: "message",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("message")}>
                    Message <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.message,
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
                        <DropdownMenuItem onClick={() => setTimeout(() => handleDelete(row.original), 100)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: contacts.data,
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
            <Head title="Liste des contacts" />
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
                        <p className="text-sm text-muted-foreground">Gérez les messages de vos utilisateurs.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className='relative'>
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={isMobile ? "Rechercher..." : "Rechercher un contact..."}
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
                <DataTable<Contact>
                    data={contacts.data}
                    columns={columns}
                    rowSelection={rowSelection}
                    onRowSelectionChange={handleRowSelectionChange}
                    emptyMessage="Aucun contact trouvé."
                />
                {/* Pagination */}
                <DataTablePagination
                    meta={contacts.meta}
                    perPage={perPage}
                    onPageChange={(page) => applyFilters({ page })}
                    onPerPageChange={(val) => {
                        setPerPage(val);
                        applyFilters({ per_page: val, page: 1 });
                    }}
                />
            </div>
            {/* AlertDialog */}
            <ConfirmDeleteDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title="Confirmer la suppression"
                message={deleteContact
                    ? `Voulez-vous vraiment supprimer ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} catégorie(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteContact ? [deleteContact.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        admin.contacts.destroy().url, { ids },
                        {
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Succès</span>
                                        <span className="text-sm text-muted-foreground">
                                            Les contacts sélectionnés ont été supprimés.
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
                    setDeleteContact(null);
                    setIsDialogOpen(false);
                }}
            />
        </AppLayout>
    );
}
