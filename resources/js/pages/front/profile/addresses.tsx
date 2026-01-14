import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ProfileLayout from "@/layouts/profile/layout";
import { Plus, MapPin, Pencil, Trash2, Phone, Home, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Address } from "@/types";
import AddressForm from "./address-form";
import { useState } from "react";
import routeAddresses from "@/routes/addresses";
import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import { toast } from "sonner";

export default function Addresses({ addresses }: { addresses: Address[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [creatingAddress, setCreatingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deleteAddress, setDeleteAddress] = useState<Address | null>(null);

    const handleEdit = (address: Address) => setEditingAddress(address);

    const handleDelete = (address: Address) => {
        setDeleteAddress(address);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout layout="guest">
            <Head title="Carnet d'adresses" />

            <ProfileLayout>
                <div className="space-y-6">
                    {/* En-tête de la section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-stone-900">Carnet d'adresses</h2>
                            <p className="text-sm text-stone-500">
                                Gérez vos adresses de livraison et de facturation.
                            </p>
                        </div>
                        <button
                            onClick={() => setCreatingAddress(true)}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-stone-900 text-stone-50 hover:bg-stone-900/90 h-10 px-4 py-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle adresse
                        </button>
                    </div>

                    {/* Liste des adresses */}
                    {addresses.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={cn(
                                        "relative flex flex-col justify-between rounded-lg border p-6 shadow-sm transition-all hover:shadow-md",
                                        address.is_default ? "border-stone-900 ring-1 ring-stone-900 bg-stone-50/50" : "border-stone-200 bg-white"
                                    )}
                                >
                                    {/* Header de la carte */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-stone-100 p-2">
                                                <Home className="h-4 w-4 text-stone-600" />
                                            </div>
                                            <h3 className="font-semibold text-stone-900">{address.alias}</h3>
                                        </div>
                                        {address.is_default ? (
                                            <span className="inline-flex items-center rounded-full border border-transparent bg-stone-900 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                                                Défaut
                                            </span>
                                        ) : <Map className="h-4 w-4 opacity-70" />}
                                    </div>

                                    {/* Détails de l'adresse */}
                                    <div className="mb-6 space-y-2 text-sm text-stone-600">
                                        <p className="font-medium text-stone-900">{address.address}</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 opacity-70" />
                                            <span>{address.address}, {address.city}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 opacity-70" />
                                            <span>{address.phone ?? 'Non défini'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto flex items-center justify-between border-t pt-4">
                                        <button className="text-xs font-medium text-stone-500 hover:text-stone-900 hover:underline">
                                            Localisation
                                        </button>
                                        <div className="flex gap-2 ml-auto">
                                            <button
                                                onClick={() => handleEdit(address)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-900 transition-colors hover:bg-stone-100">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Modifier</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(address)}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-red-600 transition-colors hover:bg-red-50 hover:border-red-200">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Supprimer</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* État vide */
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center animate-in fade-in-50">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
                                <MapPin className="h-6 w-6 text-stone-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-stone-900">Aucune adresse</h3>
                            <p className="mb-4 mt-2 text-sm text-stone-500 max-w-sm">
                                Vous n'avez pas encore ajouté d'adresse. Ajoutez-en une pour faciliter vos futures commandes.
                            </p>
                            <button
                                onClick={() => setCreatingAddress(true)}
                                className="inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 hover:bg-stone-900/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter une adresse
                            </button>
                        </div>
                    )}
                </div>
                <AddressForm
                    open={creatingAddress || !!editingAddress}
                    onClose={() => {
                        setCreatingAddress(false);
                        setEditingAddress(null);
                    }}
                    address={editingAddress}
                    submitUrl={
                        editingAddress
                            ? routeAddresses.update(editingAddress.id).url
                            : routeAddresses.store().url
                    }
                    method={editingAddress ? "PUT" : "POST"}
                />
                <ConfirmDeleteDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title="Confirmer la suppression"
                    message={`Voulez-vous vraiment supprimer ? Cette action est irréversible.`}
                    onConfirm={() => {
                        if (!deleteAddress) {
                            toast.warning(
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">Avertissement</span>
                                    <span className="text-sm text-muted-foreground">
                                        L'adresse ne peut être supprimé.
                                    </span>
                                </div>
                            );

                            return;
                        }

                        router.delete(
                            routeAddresses.destroy(deleteAddress.id).url,
                            {
                                preserveState: true,
                                onSuccess: () => {
                                    toast.success(
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">Succès</span>
                                            <span className="text-sm text-muted-foreground">
                                                L'adresse a été supprimé.
                                            </span>
                                        </div>
                                    );
                                },
                                onError: (errors: any) => {
                                    const messages: string[] = [];

                                    if (errors.error) {
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

                        setDeleteAddress(null);
                        setIsDialogOpen(false);
                    }}
                />
            </ProfileLayout>
        </AppLayout>
    );
}
