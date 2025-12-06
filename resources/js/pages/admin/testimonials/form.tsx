import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Check, ChevronsUpDown } from "lucide-react";
import { User, Product, Testimonial } from "@/types";
import { useForm } from "@inertiajs/react";
import { cn, inputClassNames } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
    open: boolean;
    onClose: () => void;
    testimonial: Testimonial | null;
    submitUrl: string;
    method: "POST" | "PUT";
    users: User[];
    products: Product[];
};

type FormData = {
    user_id: number | string;
    product_id: number | string | null;
    position: string;
    company: string;
    message: string;
    rating: number | string;
    is_approved: boolean;
    _method?: string;
};

export default function TestimonialForm({ open, onClose, testimonial, submitUrl, method, users, products }: Props) {
    // States for Combobox open status
    const [openUser, setOpenUser] = useState(false);
    const [openProduct, setOpenProduct] = useState(false);

    const form = useForm<FormData>({
        user_id: "",
        product_id: "",
        position: "",
        company: "",
        message: "",
        rating: "",
        is_approved: true
    });

    useEffect(() => {
        if (testimonial) {
            form.setData({
                user_id: testimonial.user_id || "",
                product_id: testimonial.product_id || "",
                position: testimonial.position || "",
                company: testimonial.company || "",
                message: testimonial.message || "",
                rating: testimonial.rating || "",
                is_approved: !!testimonial.is_approved
            });
        } else {
            form.reset("user_id", "product_id", "position", "company", 'message', 'rating', 'is_approved');
        }

        form.clearErrors();
    }, [testimonial]);

    useEffect(() => {
        if (!open) {
            form.clearErrors();
            // Reset local open states
            setOpenUser(false);
            setOpenProduct(false);
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (method === "PUT") {
            form.transform((data) => ({ ...data, _method: "PUT" }));
        } else {
            form.transform((data) => {
                const { _method, ...rest } = data as FormData & { _method?: string };
                return rest;
            });
        }

        form.post(submitUrl, {
            preserveScroll: 'errors',
            preserveState: true,
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold">Succès</span>
                        <span className="text-sm">{method === "PUT" ? "Témoignage mis à jour !" : "Témoignage créé !"}</span>
                    </div>
                );
                onClose();
                form.reset("user_id", "product_id", "position", "company", 'message', 'rating', 'is_approved');
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
        <Dialog open={open} onOpenChange={onClose} modal={true}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby="testimonial-dialog-description">
                <DialogHeader className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        {testimonial ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {testimonial ? "Modifier un témoignage" : "Ajouter un témoignage"}
                        </DialogTitle>
                    </div>
                    <DialogDescription id="testimonial-dialog-description" className="text-sm text-muted-foreground">
                        {testimonial
                            ? "Modifiez les informations du témoignage existant."
                            : "Remplissez le formulaire pour créer un nouveau témoignage."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* User Select (Combobox) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <Label htmlFor="user_id" className="font-medium text-sm mb-1">
                                Utilisateur
                            </Label>
                            <Popover open={openUser} onOpenChange={setOpenUser}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openUser}
                                        className={cn(
                                            "w-full justify-between font-normal",
                                            !form.data.user_id && "text-muted-foreground"
                                        )}
                                    >
                                        {form.data.user_id
                                            ? users.find((user) => user.id.toString() === form.data.user_id.toString())?.fullname
                                            : "Choisir un utilisateur"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un utilisateur..." />
                                        <CommandList>
                                            <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                {users.map((user) => (
                                                    <CommandItem
                                                        key={user.id}
                                                        value={user.fullname} // Allows searching by name
                                                        onSelect={() => {
                                                            form.setData("user_id", user.id);
                                                            setOpenUser(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                form.data.user_id?.toString() === user.id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {user.fullname}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.errors.user_id && (
                                <p className="mt-1 text-xs text-red-600">{form.errors.user_id}</p>
                            )}
                        </div>

                        {/* Company */}
                        <div>
                            <Label htmlFor="company" className="font-medium text-sm">Entreprise</Label>
                            <Input
                                id="company"
                                value={form.data.company}
                                onChange={(e) => form.setData("company", e.target.value)}
                                placeholder="Nom de l'entreprise"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.company && <p className="mt-1 text-xs text-red-600">{form.errors.company}</p>}
                        </div>

                        {/* Position */}
                        <div>
                            <Label htmlFor="position" className="font-medium text-sm">Fonction</Label>
                            <Input
                                id="position"
                                value={form.data.position}
                                onChange={(e) => form.setData("position", e.target.value)}
                                placeholder="Fonction ou métier"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.position && <p className="mt-1 text-xs text-red-600">{form.errors.position}</p>}
                        </div>

                        {/* Rating */}
                        <div>
                            <Label htmlFor="rating" className="font-medium text-sm">Note</Label>
                            <Input
                                id="rating"
                                type="number"
                                min={0}
                                max={5}
                                step={1}
                                value={form.data.rating}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 5)) {
                                        form.setData("rating", val);
                                    }
                                }}
                                placeholder="Note sur 5"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.rating && <p className="mt-1 text-xs text-red-600">{form.errors.rating}</p>}
                        </div>
                    </div>

                    {/* Product Select (Combobox) */}
                    <div className="flex flex-col">
                        <Label htmlFor="product_id" className="font-medium text-sm mb-1">
                            Produit
                        </Label>
                        <Popover open={openProduct} onOpenChange={setOpenProduct}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openProduct}
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !form.data.product_id && "text-muted-foreground"
                                    )}
                                >
                                    {form.data.product_id
                                        ? products.find((product) => product.id.toString() === form.data.product_id?.toString())?.name
                                        : "Choisir un produit"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Rechercher un produit..." />
                                    <CommandList>
                                        <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="none"
                                                onSelect={() => {
                                                    form.setData("product_id", null);
                                                    setOpenProduct(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        !form.data.product_id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                Aucun produit
                                            </CommandItem>
                                            {products.map((product) => (
                                                <CommandItem
                                                    key={product.id}
                                                    value={product.name}
                                                    onSelect={() => {
                                                        form.setData("product_id", product.id);
                                                        setOpenProduct(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            form.data.product_id?.toString() === product.id.toString()
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {product.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.errors.product_id && (
                            <p className="mt-1 text-xs text-red-600">{form.errors.product_id}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="message" className="font-medium text-sm">Commentaire</Label>
                        <Textarea
                            value={form.data.message}
                            onChange={(e) => form.setData("message", e.target.value)}
                            placeholder="Votre commentaire..."
                            className={cn("mt-1", inputClassNames())}
                            id="message"
                        ></Textarea>
                        {form.errors.message && <p className="mt-1 text-xs text-red-600">{form.errors.message}</p>}
                    </div>

                    {/* Approved */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_approved"
                            checked={Boolean(form.data.is_approved)}
                            onCheckedChange={(checked) => form.setData("is_approved", checked)}
                        />
                        <Label htmlFor="is_approved">Approuvé</Label>
                    </div>

                    {/* Actions */}
                    <DialogFooter className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="px-6 py-2"
                            onClick={() => {
                                onClose();
                                form.reset();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2" disabled={form.processing}>
                            {testimonial ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
