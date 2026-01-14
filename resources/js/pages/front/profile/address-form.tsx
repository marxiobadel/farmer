import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Check, ChevronsUpDown } from "lucide-react";
import { Address, Country, SharedData } from "@/types";
import { useForm, usePage } from "@inertiajs/react";
import { cn, inputClassNames } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FormProps = {
    open: boolean;
    onClose: () => void;
    address: Address | null;
    submitUrl: string;
    method: "POST" | "PUT";
};

type FormData = {
    alias: string;
    firstname: string;
    lastname: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country_id: number | string | null;
    is_default: boolean;
    _method?: string;
};

export default function AddressForm({ open, onClose, address, submitUrl, method }: FormProps) {
    const [openCountry, setOpenCountry] = useState(false);

    const props = usePage<SharedData>().props;
    const countries = props.countries as Country[] || [];

    const form = useForm<FormData>({
        alias: '',
        firstname: '',
        lastname: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country_id: '',
        is_default: false,
    });

    useEffect(() => {
        if (address) {
            form.setData({
                alias: address.alias || '',
                firstname: address.firstname || '',
                lastname: address.lastname || '',
                phone: address.phone || '',
                address: address.address || '',
                city: address.city || '',
                state: address.state || '',
                postal_code: address.postal_code || '',
                country_id: address.country_id || '',
                is_default: address.is_default,
            });
        } else {
            form.reset();
        }

        form.clearErrors();
    }, [address]);

    useEffect(() => {
        if (!open) {
            form.clearErrors();
            setOpenCountry(false);
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
                        <span className="text-sm">{method === "PUT" ? "Adresse mis à jour !" : "Adresse créée !"}</span>
                    </div>
                );
                onClose();
                form.reset();
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
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby="address-dialog-description">
                <DialogHeader className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        {address ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {address ? "Modifier une adresse" : "Ajouter une adresse"}
                        </DialogTitle>
                    </div>
                    <DialogDescription id="address-dialog-description" className="text-sm text-muted-foreground">
                        {address
                            ? "Modifiez les informations de l'adresse existante."
                            : "Remplissez le formulaire pour créer un nouvelle adresse."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* User Select (Combobox) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="alias" className="font-medium text-sm">Alias</Label>
                            <Input
                                id="alias"
                                value={form.data.alias}
                                onChange={(e) => form.setData("alias", e.target.value)}
                                placeholder="Ex: Maison, Bureau, etc."
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.alias && <p className="mt-1 text-xs text-red-600">{form.errors.alias}</p>}
                        </div>

                        {/* Position */}
                        <div>
                            <Label htmlFor="lastname" className="font-medium text-sm">Nom</Label>
                            <Input
                                id="lastname"
                                value={form.data.lastname}
                                onChange={(e) => form.setData("lastname", e.target.value)}
                                placeholder="Nom ou raison sociale"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.lastname && <p className="mt-1 text-xs text-red-600">{form.errors.lastname}</p>}
                        </div>
                        <div>
                            <Label htmlFor="firstname" className="font-medium text-sm">Prénom</Label>
                            <Input
                                id="firstname"
                                value={form.data.firstname}
                                onChange={(e) => form.setData("firstname", e.target.value)}
                                placeholder="Prénom"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.firstname && <p className="mt-1 text-xs text-red-600">{form.errors.firstname}</p>}
                        </div>
                        <div>
                            <Label htmlFor="phone" className="font-medium text-sm">Téléphone</Label>
                            <Input
                                id="phone"
                                value={form.data.phone}
                                onChange={(e) => form.setData("phone", e.target.value)}
                                placeholder="xxxxxxxxxx"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.phone && <p className="mt-1 text-xs text-red-600">{form.errors.phone}</p>}
                        </div>
                        <div>
                            <Label htmlFor="city" className="font-medium text-sm">Ville</Label>
                            <Input
                                id="city"
                                value={form.data.city}
                                onChange={(e) => form.setData("city", e.target.value)}
                                placeholder="Ex: Douala"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.city && <p className="mt-1 text-xs text-red-600">{form.errors.city}</p>}
                        </div>
                        <div>
                            <Label htmlFor="state" className="font-medium text-sm">État / Région</Label>
                            <Input
                                id="state"
                                value={form.data.state}
                                onChange={(e) => form.setData("state", e.target.value)}
                                placeholder="Ex: Littoral"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.state && <p className="mt-1 text-xs text-red-600">{form.errors.state}</p>}
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="country_id" className="font-medium text-sm mb-1">
                                Pays
                            </Label>
                            <Popover open={openCountry} onOpenChange={setOpenCountry}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCountry}
                                        className={cn(
                                            "w-full justify-between font-normal",
                                            !form.data.country_id && "text-muted-foreground"
                                        )}
                                    >
                                        {form.data.country_id
                                            ? countries.find((country) => country.id.toString() === form.data.country_id?.toString())?.name
                                            : "Choisir un pays"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un pays..." />
                                        <CommandList>
                                            <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="none"
                                                    onSelect={() => {
                                                        form.setData("country_id", null);
                                                        setOpenCountry(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            !form.data.country_id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    Aucun pays
                                                </CommandItem>
                                                {countries.map((country) => (
                                                    <CommandItem
                                                        key={country.id}
                                                        value={country.name}
                                                        onSelect={() => {
                                                            form.setData("country_id", country.id);
                                                            setOpenCountry(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                form.data.country_id?.toString() === country.id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {country.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.errors.country_id && (
                                <p className="mt-1 text-xs text-red-600">{form.errors.country_id}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="postal_code" className="font-medium text-sm">Code postal</Label>
                            <Input
                                id="postal_code"
                                value={form.data.postal_code}
                                onChange={(e) => form.setData("postal_code", e.target.value)}
                                placeholder="Ex: 12345"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.postal_code && <p className="mt-1 text-xs text-red-600">{form.errors.postal_code}</p>}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="address" className="font-medium text-sm">Adresse complète</Label>
                        <Input
                            id="address"
                            value={form.data.address}
                            onChange={(e) => form.setData("address", e.target.value)}
                            placeholder="Ex: Maképé village, Douala"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.address && <p className="mt-1 text-xs text-red-600">{form.errors.address}</p>}
                    </div>

                    {/* Approved */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_default"
                            checked={Boolean(form.data.is_default)}
                            onCheckedChange={(checked) => form.setData("is_default", checked)}
                        />
                        <Label htmlFor="is_default">Adresse par défaut</Label>
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
                            {address ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
