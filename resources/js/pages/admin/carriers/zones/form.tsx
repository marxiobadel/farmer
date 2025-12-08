import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Check } from "lucide-react";
import { useForm } from "@inertiajs/react";
import type { Country, Zone } from "@/types";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";
import { cn, inputClassNames } from "@/lib/utils";

type Props = {
    open: boolean;
    onClose: () => void;
    zone: Zone | null;
    submitUrl: string;
    method: "POST" | "PUT";
    countries: Country[];
};

type FormData = {
    name: string;
    longitude: string;
    latitude: string;
    country_id: number | null;
    _method?: string;
};

export default function ZoneForm({ open, onClose, zone, submitUrl, method, countries }: Props) {
    const form = useForm<FormData>({
        name: "",
        longitude: "",
        latitude: "",
        country_id: null,
    });

    // Important: whenever `category` changes (open for edit), populate the form
    useEffect(() => {
        if (zone) {
            form.setData({
                name: zone.name ?? "",
                longitude: zone.longitude ?? "",
                latitude: zone.latitude ?? "",
                country_id: zone.country ? zone.country.id : null,
            });
        } else {
            form.reset("name", "longitude", "latitude", "country_id");
        }

        form.clearErrors();
    }, [zone]);

    // When dialog closes, clear processing/errors and reset form if desired
    useEffect(() => {
        if (!open) {
            // keep server validation errors cleared
            form.clearErrors();
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
            preserveState: true,
            preserveScroll: 'errors',
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold">Succès</span>
                        <span className="text-sm">{method === "PUT" ? "Zone mise à jour !" : "Zone créée !"}</span>
                    </div>
                );
                // reset/close
                onClose();
                // Reset form to defaults so next "create" is clean
                form.reset("name", "longitude", "latitude", "country_id");
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
                        {zone ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {zone ? "Modifier la zone" : "Ajouter une zone"}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {zone ? "Modifiez les informations de la zone." : "Remplissez le formulaire pour ajouter une nouvelle zone."}
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
                    <div>
                        <Label htmlFor="longitude" className="font-medium text-sm">Longitude</Label>
                        <Input
                            id="longitude"
                            type="number"
                            value={form.data.longitude}
                            onChange={(e) => form.setData("longitude", e.target.value)}
                            onFocus={() => form.clearErrors("longitude")}
                            placeholder="Entrez la longitude"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.longitude && <p className="mt-1 text-xs text-red-600">{form.errors.longitude}</p>}
                    </div>
                    <div>
                        <Label htmlFor="latitude" className="font-medium text-sm">Latitude</Label>
                        <Input
                            id="latitude"
                            type="number"
                            value={form.data.latitude}
                            onChange={(e) => form.setData("latitude", e.target.value)}
                            onFocus={() => form.clearErrors("latitude")}
                            placeholder="Entrez la latitude"
                            className={cn("mt-1", inputClassNames())}
                        />
                        {form.errors.latitude && <p className="mt-1 text-xs text-red-600">{form.errors.latitude}</p>}
                    </div>

                    {/* Parent category (shadcn combobox/popover+command) */}
                    <div className="flex flex-col gap-1">
                        <Label className="font-medium text-sm">Pays</Label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {form.data.country_id
                                        ? (countries.find((c) => c.id === form.data.country_id)?.name ?? "—")
                                        : "Aucun pays"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Rechercher..." />
                                    <CommandList>
                                        <CommandEmpty>Aucun pays trouvé.</CommandEmpty>

                                        <CommandGroup>
                                            <CommandItem
                                                value="0"
                                                onSelect={() => form.setData("country_id", null)}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", form.data.country_id === null ? "opacity-100" : "opacity-0")} />
                                                Aucun
                                            </CommandItem>

                                            {countries
                                                .map((country) => (
                                                    <CommandItem
                                                        key={country.id}
                                                        value={String(country.id)}
                                                        onSelect={() => form.setData("country_id", country.id)}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", form.data.country_id === country.id ? "opacity-100" : "opacity-0")} />
                                                        {country.name}
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {form.errors.country_id && <p className="mt-1 text-xs text-red-600">{form.errors.country_id}</p>}
                    </div>

                    <DialogFooter className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="px-6 py-2"
                            onClick={() => {
                                onClose();
                                form.reset("name", "longitude", "latitude", "country_id");
                                form.clearErrors();
                            }}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="px-6 py-2" disabled={form.processing}>
                            {zone ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
