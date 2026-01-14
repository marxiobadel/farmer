import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { ProRequest } from "@/types";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { proStatus } from "@/data";
import { inputClassNames } from "@/lib/utils";
import admin from "@/routes/admin";

type Props = {
    open: boolean;
    onClose: () => void;
    proRequest: ProRequest | null;
};

type FormData = {
    status: string;
};

export default function ProForm({ open, onClose, proRequest }: Props) {
    const form = useForm<FormData>({
        status: "",
    });

    useEffect(() => {
        if (proRequest) {
            form.setData({
                status: proRequest.status || "",
            });
        } else {
            form.reset();
        }

        form.clearErrors();
    }, [proRequest]);

    useEffect(() => {
        if (!open) {
            form.clearErrors();
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!proRequest) {
            toast.error("Quelque chose s'est mal passée.");
            return;
        }

        form.put(admin.proRequests.update(proRequest.id).url, {
            preserveScroll: 'errors',
            preserveState: true,
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold">Succès</span>
                        <span className="text-sm">Compte mis à jour avec succès !</span>
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
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="pro-dialog-description">
                <DialogHeader className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <Edit className="h-5 w-5 text-primary" />
                        <DialogTitle className="text-lg font-semibold">
                            Modifier un compte Pro
                        </DialogTitle>
                    </div>
                    <DialogDescription id="pro-dialog-description" className="text-sm text-muted-foreground">
                        Remplissez le formulaire pour mettre à jour le compte.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label>Statut *</Label>
                        <Select onValueChange={val => form.setData('status', val)} value={form.data.status}>
                            <SelectTrigger className={inputClassNames()}>
                                <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                                {proStatus.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.status && <p className="text-xs text-red-500">{form.errors.status}</p>}
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
                            Mettre à jour
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
