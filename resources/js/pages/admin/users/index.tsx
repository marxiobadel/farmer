import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginationMeta, User, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, Plus, Download, Search, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { dateTimeFormatOptions } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { useEventBus } from '@/context/event-bus-context';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import { FaTimesCircle } from 'react-icons/fa';
import { userRoles } from '@/data';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: 'Utilisateurs', href: '#' },
]

interface PageProps {
    users: {
        data: User[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    }
}

export default function Index({ users, filters }: PageProps) {
    const { on, clearLast } = useEventBus();

    const { auth } = usePage<SharedData>().props;
    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const toggleSort = (column: keyof User) => {
        let dir: "asc" | "desc" | "" = "asc"
        if (sort === column) dir = "desc"
        else if (sort === "-" + column) dir = ""
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column)
        setSort(newSort);
        applyFilters({ sort: newSort })
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(admin.users.index().url, {
            search,
            sort,
            per_page: perPage,
            page: users.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleDelete = (user: User) => {
        setDeleteUser(user);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteUser(null);
            setIsDialogOpen(true);
        }
    };

    const handleExport = () => {
        const headers = ['Nom', 'Prénom', 'E-mail', 'Rôle', 'Statut', "Date d'inscription"];
        const rows = users.data.map(u => [
            u.lastname,
            u.firstname,
            u.email,
            userRoles.find(r => r.value === u.roles[0])?.label || u.roles[0] || 'N/A',
            u.is_active ? 'Actif' : 'Inactif',
            u.created_at
        ]);
        const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "users_export.csv");
        link.click();
    };

    const columns = useMemo<ColumnDef<User>[]>(() => [
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
            cell: ({ row }) =>
                row.original.id !== auth.user.id ? (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                    />
                ) : null,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "lastname",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("lastname")}>
                    Nom <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.lastname,
        },
        {
            accessorKey: "firstname",
            header: () => (
                <Button variant="ghost" onClick={() => toggleSort("firstname")}>
                    Prénom <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => row.original.firstname,
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
            accessorKey: "roles",
            header: "Rôle",
            cell: ({ row }) => {
                const role = row.original.roles[0] ?? null;
                if (!role) return <span className="text-muted-foreground italic">Aucun rôle</span>;
                let colorClass = "bg-muted";
                if (role === "superadmin") colorClass = "bg-primary/10 text-primary";
                else if (role === "visitor") colorClass = "bg-blue-100 text-blue-800";
                else if (role === "customer") colorClass = "bg-green-100 text-green-800";
                else if (role === "admin") colorClass = "bg-amber-100 text-amber-800";
                return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                    {userRoles.find(r => r.value === role)?.label.toLowerCase() || role}
                </span>
            }
        },
        {
            accessorKey: 'is_active',
            header: "Statut",
            cell: ({ row }) => {
                if (row.original.is_active)
                    return <CheckCircle size={18} className={`text-green-600`} />
                else
                    return <FaTimesCircle size={18} className={`text-red-600`} />
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
                        <DropdownMenuItem onClick={() => router.visit(admin.users.edit(row.original.id).url)}>
                            <Edit className="mr-1 h-4 w-4" /> Éditer
                        </DropdownMenuItem>
                        {auth.user.id !== row.original.id &&
                            <DropdownMenuItem onClick={() => setTimeout(() => handleDelete(row.original), 100)}>
                                <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }
    ], [sort, auth.user.id]);

    const table = useReactTable({
        data: users.data,
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
        const offUserSaved = on('user.saved', (message) => {
            toast.success(
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Succès</span>
                    <span className="text-sm text-muted-foreground">{message}</span>
                </div>);
        }, { replay: true, once: true });

        return () => {
            offUserSaved();
            clearLast?.('user.saved');
        }
    }, [on]);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Utilisateurs" />
            <div className="p-4 sm:p-6 lg:p-8">

                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-end flex-wrap">
                        <Button
                            variant="outline"
                            className="ml-2"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" /> Exporter les utilisateurs
                        </Button>
                        <Button
                            className="ml-2"
                            onClick={() => router.visit(admin.users.create().url)}
                        >
                            <Plus className="h-4 w-4" /> Ajouter un utilisateur
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
                            <p className="text-sm text-muted-foreground">Gérez les comptes utilisateurs et leurs rôles.</p>
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
                    <DataTable<User>
                        data={users.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucun utilisateur trouvé."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={users.meta}
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
                message={deleteUser
                    ? `Voulez-vous vraiment supprimer ${deleteUser.fullname} ? Cette action est irréversible.`
                    : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} utilisateur(s) ? Cette action est irréversible.`}
                onConfirm={() => {
                    const ids = deleteUser ? [deleteUser.id]
                        : Object.keys(rowSelection).map(k => {
                            const row = table.getRowModel().rows[Number(k)];
                            return row.original.id;
                        });

                    if (ids.length === 0) return;

                    router.post(
                        admin.users.destroy().url,
                        { ids },
                        {
                            preserveState: true,
                            onSuccess: () => {
                                toast.success(
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground">Succès</span>
                                        <span className="text-sm text-muted-foreground">
                                            Les utilisateurs sélectionnés ont été supprimés.
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
                    setDeleteUser(null);
                    setIsDialogOpen(false);
                }}
            />
        </AppLayout >
    );
}
