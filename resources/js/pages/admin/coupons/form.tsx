import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit } from "lucide-react";
import { Coupon } from "@/types";
import { useForm } from "@inertiajs/react";
import { cn, inputClassNames } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
    open: boolean;
    onClose: () => void;
    coupon: Coupon | null;
    submitUrl: string;
    method: "POST" | "PUT";
};

type FormData = {
    code: string;
    type: string;
    value: number | string;
    min_order_amount: number | string;
    usage_limit: number | string;
    expires_at: string;
    is_active: boolean;
    _method?: string;
};

export default function CouponForm({ open, onClose, coupon, submitUrl, method }: Props) {
    // States for Combobox open status
    const form = useForm<FormData>({
        code: "",
        type: "fixed",
        value: "",
        min_order_amount: "",
        usage_limit: "",
        expires_at: "",
        is_active: true
    });

    useEffect(() => {
        if (coupon) {
            form.setData({
                code: coupon.code || "",
                type: coupon.type || "",
                value: coupon.value || "",
                min_order_amount: coupon.min_order_amount || "",
                usage_limit: coupon.usage_limit || "",
                expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : "",
                is_active: !!coupon.is_active
            });
        } else {
            form.reset();
        }

        form.clearErrors();
    }, [coupon]);

    useEffect(() => {
        if (!open) {
            form.clearErrors();
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
                        <span className="text-sm">{method === "PUT" ? "Coupon mis à jour !" : "Coupon créé !"}</span>
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
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" aria-describedby="coupon-dialog-description">
                <DialogHeader className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        {coupon ? <Edit className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-lg font-semibold">
                            {coupon ? "Modifier un coupon" : "Créer un coupon"}
                        </DialogTitle>
                    </div>
                    <DialogDescription id="coupon-dialog-description" className="text-sm text-muted-foreground">
                        {coupon
                            ? "Modifiez les informations du coupon existant."
                            : "Remplissez le formulaire pour créer un nouveau coupon."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="code" className="font-medium text-sm">Code</Label>
                            <Input
                                id="code"
                                value={form.data.code}
                                onChange={(e) => form.setData("code", e.target.value)}
                                placeholder="Code coupon"
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.code && <p className="mt-1 text-xs text-red-600">{form.errors.code}</p>}
                        </div>
                        <div>
                            <Label htmlFor="type" className="font-medium text-sm">Type</Label>
                            <Select
                                value={form.data.type}
                                onValueChange={(value) => form.setData("type", value)}
                            >
                                <SelectTrigger className={cn("mt-1", inputClassNames())}>
                                    <SelectValue placeholder="Choisir un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='fixed'>Remise fixe</SelectItem>
                                    <SelectItem value='percent'>Pourcentage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rating */}
                        <div>
                            <Label htmlFor="value" className="font-medium text-sm">Valeur de la remise</Label>
                            <Input
                                id="value"
                                type="number"
                                value={form.data.value}
                                onChange={(e) => form.setData("value", e.target.value)}
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.value && <p className="mt-1 text-xs text-red-600">{form.errors.value}</p>}
                        </div>
                        <div>
                            <Label htmlFor="min_order_amount" className="font-medium text-sm">Montant min pour l'utiliser</Label>
                            <Input
                                id="min_order_amount"
                                type="number"
                                value={form.data.min_order_amount}
                                onChange={(e) => form.setData("min_order_amount", e.target.value)}
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.min_order_amount && <p className="mt-1 text-xs text-red-600">{form.errors.min_order_amount}</p>}
                        </div>
                        <div>
                            <Label htmlFor="usage_limit" className="font-medium text-sm">Limite globale d'utilisation</Label>
                            <Input
                                id="usage_limit"
                                type="number"
                                value={form.data.usage_limit}
                                onChange={(e) => form.setData("usage_limit", e.target.value)}
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.usage_limit && <p className="mt-1 text-xs text-red-600">{form.errors.usage_limit}</p>}
                        </div>
                        <div>
                            <Label htmlFor="expires_at" className="font-medium text-sm">Date d'expiration</Label>
                            <Input
                                id="expires_at"
                                type="date"
                                value={form.data.expires_at}
                                onChange={(e) => form.setData("expires_at", e.target.value)}
                                className={cn("mt-1", inputClassNames())}
                            />
                            {form.errors.expires_at && <p className="mt-1 text-xs text-red-600">{form.errors.expires_at}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={Boolean(form.data.is_active)}
                            onCheckedChange={(checked) => form.setData("is_active", checked)}
                        />
                        <Label htmlFor="is_active">Statut</Label>
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
                            {coupon ? "Mettre à jour" : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
