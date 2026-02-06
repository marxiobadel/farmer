import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/image-upload";
import { PlusCircle, Edit, Check } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { Category } from "@/types";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { cn, inputClassNames } from "@/lib/utils";

type Props = {
    open: boolean;
    onClose: () => void;
    category: Category | null;
    submitUrl: string;
    method: "POST" | "PUT";
    listCategories: Category[];
};

type FormData = {
    name: string;
    status: boolean;
    image: File | null;
    parent_id: number | null;
    position: string | number;
    _method?: string;
};

export default function CategoryForm({ open, onClose, category, submitUrl, method, listCategories }: Props) {
    const form = useForm<FormData>({
        name: "",
        status: true,
        image: null,
        parent_id: null,
        position: '0'
    });

    // Important: whenever `category` changes (open for edit), populate the form
    useEffect(() => {
        if (category) {
            form.setData({
                name: category.name ?? "",
                status: !!category.status,
                image: null, // don't auto-set File objects, only previews via cover_url
                parent_id: category.parent_id ?? null,
                position: category.position ?? '0'
            });
        } else {
            form.reset("name", "status", "image", "parent_id");
        }

        form.clearErrors();
    }, [category]);

    // When dialog closes, clear processing/errors and reset form if desired
    useEffect(() => {
        if (!open) {
            // keep server validation errors cleared
            form.clearErrors();
            // reset the image/file field only (so the preview doesn't remain)
            form.setData("image", null);
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // For PUT, instruct Laravel to treat as PUT through _method field
        if (method === "PUT") {
            form.transform((data) => ({ ...data, _method: "PUT" }));
        } else {
            // ensure we don't send a lingering _method for POST
            form.transform((data) => {
                const { _method, ...rest } = data as FormData & { _method?: string };
                return rest;
            });
        }

        form.post(submitUrl, {
            forceFormData: true,
            preserveState: true,
            preserveScroll: 'errors',
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold">Succès</span>
                        <span className="text-sm">{method === "PUT" ? "Catégorie mise à jour !" : "Catégorie créée !"}</span>
                    </div>
                );
                // reset/close
                onClose();
                // Reset form to defaults so next "create" is clean
                form.reset("name", "status", "image", "parent_id");
            },
            onError: (errors) => {
                if (errors.error) {
                    toast.error(
                        <div className="flex flex-col">
                            <span className="font-semibold">Erreur</span>
                            <span className="text-sm">{errors.error}</span>
                        </div>
                    );
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        {category ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {category ? "Modifier la catégorie" : "Ajouter une catégorie"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {category ? "Modifiez les informations de la catégorie existante." : "Remplissez le formulaire pour créer une nouvelle catégorie."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <Label htmlFor="name" className="font-medium text-sm">Nom</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData("name", e.target.value)}
                            onFocus={() => form.clearErrors("name")}
                            placeholder="Entrez le nom"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                    </div>

                    {/* Parent category (shadcn combobox/popover+command) */}
                    <div className="flex flex-col gap-1">
                        <Label className="font-medium text-sm">Catégorie parent</Label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {form.data.parent_id
                                        ? (listCategories.find((c) => c.id === form.data.parent_id)?.name ?? "—")
                                        : "Aucune catégorie parent"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Rechercher..." />
                                    <CommandList>
                                        <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>

                                        <CommandGroup>
                                            <CommandItem
                                                value="0"
                                                onSelect={() => form.setData("parent_id", null)}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", form.data.parent_id === null ? "opacity-100" : "opacity-0")} />
                                                Aucune
                                            </CommandItem>

                                            {listCategories
                                                .filter(c => category ? c.id !== category.id : true) // prevent selecting itself
                                                .map((cat) => (
                                                    <CommandItem
                                                        key={cat.id}
                                                        value={String(cat.id)}
                                                        onSelect={() => form.setData("parent_id", cat.id)}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", form.data.parent_id === cat.id ? "opacity-100" : "opacity-0")} />
                                                        {cat.name}
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {form.errors.parent_id && <p className="mt-1 text-xs text-red-600">{form.errors.parent_id}</p>}
                    </div>

                    <div>
                        <Label htmlFor="position" className="font-medium text-sm">Position</Label>
                        <Input
                            id="position"
                            type="number"
                            value={String(form.data.position)}
                            onChange={(e) => form.setData("position", e.target.value)}
                            onFocus={() => form.clearErrors("position")}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.position && <p className="mt-1 text-xs text-red-600">{form.errors.position}</p>}
                    </div>

                    {/* Image */}
                    <div>
                        <Label className="font-medium text-sm">Image</Label>
                        <ImageUpload
                            value={form.data.image}
                            onChange={(file) => form.setData("image", file)}
                            error={form.errors.image}
                            existingUrl={category?.cover_url}
                        />
                        {form.errors.image && <p className="mt-1 text-xs text-red-600">{form.errors.image}</p>}
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="status"
                            checked={form.data.status}
                            onCheckedChange={(checked) => form.setData("status", checked)}
                        />
                        <Label htmlFor="status">Statut</Label>
                    </div>

                    <DialogFooter className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="px-6 py-2"
                            onClick={() => {
                                onClose();
                                form.reset("name", "status", "image", "parent_id");
                                form.clearErrors();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2" disabled={form.processing}>
                            {category ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
