import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginationMeta, Category } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, Edit, Trash2, Plus, Search, PlusCircle, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { FaTimesCircle } from 'react-icons/fa';
import ImageUpload from '@/components/image-upload';
import { Switch } from '@/components/ui/switch';
import { dateTimeFormatOptions } from '@/lib/utils';
import ConfirmDeleteDialog from '@/components/confirm-delete-dialog';
import DataTablePagination from '@/components/datatable-pagination';
import DataTable from '@/components/datatable';
import { RowActions } from '@/components/row-actions';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import ProductsLayout from '@/layouts/products/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tableau de bord', href: dashboard().url },
    { title: "Catégories de produits", href: '#' },
];

interface PageProps {
    categories: {
        data: Category[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        per_page?: number;
    }
}

type CategoryFormData = {
    name: string;
    status: boolean;
    image: File | null;
}

export default function Index({ categories, filters }: PageProps) {
    const type = 'products';

    const isMobile = useIsMobile();

    const [search, setSearch] = useState(filters.search ?? "");
    const [sort, setSort] = useState("");
    const [perPage, setPerPage] = useState<number>(filters.per_page ?? 10);
    const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const [creatingCategory, setCreatingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const categoryForm = useForm<CategoryFormData>({
        name: "",
        status: true,
        image: null
    });

    const toggleSort = (column: keyof Category) => {
        let dir: "asc" | "desc" | "" = "asc";
        if (sort === column) dir = "desc";
        else if (sort === "-" + column) dir = "";
        const newSort = dir === "" ? "" : dir === "desc" ? "-" + column : String(column);
        setSort(newSort);
        applyFilters({ sort: newSort });
    }

    const applyFilters = (newFilters: Partial<PageProps["filters"]> & { page?: number }) => {
        router.get(admin.categories.index({ type }).url, {
            search,
            sort,
            per_page: perPage,
            page: categories.meta.current_page,
            ...newFilters,
        }, { preserveState: true, replace: true });
    }

    const handleEdit = (category: Category) => {
        categoryForm.clearErrors();
        setEditingCategory(category);
        categoryForm.setData({
            name: category.name,
            status: category.status,
            image: null,
        });
    };

    const handleDelete = (category: Category) => {
        setDeleteCategory(category);
        setIsDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (Object.keys(rowSelection).length > 0) {
            setDeleteCategory(null);
            setIsDialogOpen(true);
        }
    };

    const columns = useMemo<ColumnDef<Category>[]>(() => [
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
            accessorKey: "products_count",
            header: 'Produits',
            cell: ({ row }) => row.original.products_count,
        },
        {
            accessorKey: 'status',
            header: "Statut",
            cell: ({ row }) => {
                if (row.original.status)
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
                <RowActions row={row.original} onEdit={handleEdit} onDelete={handleDelete} />
            ),
        }
    ], [sort]);

    const table = useReactTable({
        data: categories.data,
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
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Catégorie de cours" />
            <ProductsLayout>
                <div className="space-y-6 md:mt-[-77px]">
                    {/* Header */}
                    <div className="flex justify-end flex-wrap">
                        <Button
                            className="ml-2"
                            onClick={() => {
                                categoryForm.clearErrors();
                                setCreatingCategory(true);
                                categoryForm.setData('name', "");
                                categoryForm.setData('status', true);
                                categoryForm.setData('image', null);
                            }}
                        >
                            <Plus className="h-4 w-4" /> Ajouter une catégorie
                        </Button>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Catégorie</h1>
                            <p className="text-sm text-muted-foreground">Gérez les catégories de cours.</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className='relative'>
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={isMobile ? "Rechercher..." : "Rechercher une catégorie..."}
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
                    <DataTable<Category>
                        data={categories.data}
                        columns={columns}
                        rowSelection={rowSelection}
                        onRowSelectionChange={handleRowSelectionChange}
                        emptyMessage="Aucune catégorie trouvée."
                    />

                    {/* Pagination */}
                    <DataTablePagination
                        meta={categories.meta}
                        perPage={perPage}
                        onPageChange={(page) => applyFilters({ page })}
                        onPerPageChange={(val) => {
                            setPerPage(val);
                            applyFilters({ per_page: val, page: 1 });
                        }}
                    />
                </div>

                {(creatingCategory || editingCategory) && (
                    <Dialog
                        open={creatingCategory || !!editingCategory}
                        onOpenChange={() => {
                            setCreatingCategory(false);
                            setEditingCategory(null);
                        }}
                    >
                        <DialogContent className="sm:max-w-lg" aria-describedby="category-dialog-description">
                            <DialogHeader className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    {editingCategory ? (
                                        <Edit className="h-5 w-5 text-primary" />
                                    ) : (
                                        <PlusCircle className="h-5 w-5 text-primary" />
                                    )}
                                    <DialogTitle className="text-lg font-semibold">
                                        {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
                                    </DialogTitle>
                                </div>
                                <DialogDescription
                                    id="category-dialog-description"
                                    className="text-sm text-muted-foreground"
                                >
                                    {editingCategory
                                        ? "Modifiez les informations de la catégorie existante."
                                        : "Remplissez le formulaire pour créer une nouvelle catégorie."}
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    if (editingCategory) {
                                        categoryForm.transform((data) => ({
                                            ...data,
                                            _method: "PUT",
                                        } as CategoryFormData & { _method: string }));
                                        categoryForm.post(admin.categories.update({ type, category: editingCategory.slug }).url, {
                                            preserveState: true,
                                            forceFormData: true,
                                            onSuccess: () => {
                                                toast.success(
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground">Succès</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            Catégorie mis à jour !
                                                        </span>
                                                    </div>);
                                                setEditingCategory(null);
                                            },
                                        });
                                    } else {
                                        categoryForm.transform((data) => {
                                            const { _method, ...rest } = data as CategoryFormData & { _method?: string };
                                            return rest;
                                        });
                                        categoryForm.post(admin.categories.store({ type }).url, {
                                            preserveState: true,
                                            forceFormData: true,
                                            onSuccess: () => {
                                                toast.success(
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground">Succès</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            Catégorie ajoutée avec succès !
                                                        </span>
                                                    </div>);
                                                setCreatingCategory(false);
                                            },
                                        });
                                    }
                                }}
                                className="space-y-4"
                            >
                                {/* Name Fields */}
                                <div>
                                    <Label htmlFor="name" className="font-medium text-sm">Nom</Label>
                                    <Input
                                        id="name"
                                        value={categoryForm.data.name}
                                        onChange={(e) => categoryForm.setData("name", e.target.value)}
                                        onFocus={() => categoryForm.clearErrors('name')}
                                        placeholder="Entrez le nom"
                                        className="mt-1 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent"
                                    />
                                    {categoryForm.errors.name && (
                                        <p className="mt-1 text-xs text-red-600">{categoryForm.errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label className="font-medium text-sm">Image</Label>
                                    <ImageUpload
                                        value={categoryForm.data.image}
                                        onChange={(file) => categoryForm.setData("image", file)}
                                        error={categoryForm.errors.image}
                                    />
                                    {!categoryForm.data.image && editingCategory?.cover_url && (
                                        <div className="mt-2 relative w-32 h-32">
                                            <img
                                                src={editingCategory.cover_url}
                                                alt="Current image"
                                                className="w-32 h-32 object-cover rounded-lg border"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="status"
                                        checked={categoryForm.data.status}
                                        onCheckedChange={(checked) => categoryForm.setData("status", checked)}
                                    />
                                    <Label htmlFor="status">Statut</Label>
                                </div>
                                {/* Actions */}
                                <DialogFooter className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-6 py-2"
                                        onClick={() => {
                                            setCreatingCategory(false);
                                            setEditingCategory(null);
                                            categoryForm.reset(); // Reset fields when closing
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                    <Button type="submit" className="px-6 py-2" disabled={categoryForm.processing}>
                                        {editingCategory ? "Mettre à jour" : "Créer"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}

                {/* AlertDialog */}
                <ConfirmDeleteDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title="Confirmer la suppression"
                    message={deleteCategory
                        ? `Voulez-vous vraiment supprimer ${deleteCategory.name} ? Cette action est irréversible.`
                        : `Voulez-vous vraiment supprimer ${Object.keys(rowSelection).length} catégorie(s) ? Cette action est irréversible.`}
                    onConfirm={() => {
                        const ids = deleteCategory ? [deleteCategory.id]
                            : Object.keys(rowSelection).map(k => {
                                const row = table.getRowModel().rows[Number(k)];
                                return row.original.id;
                            });

                        if (ids.length === 0) return;

                        router.post(
                            admin.categories.destroy({ type }).url, { ids },
                            {
                                preserveState: true,
                                onSuccess: () => {
                                    toast.success(
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">Succès</span>
                                            <span className="text-sm text-muted-foreground">
                                                Les catégories sélectionnées ont été supprimées.
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
                        setDeleteCategory(null);
                        setIsDialogOpen(false);
                    }}
                />
            </ProductsLayout>
        </AppLayout>
    );
}
