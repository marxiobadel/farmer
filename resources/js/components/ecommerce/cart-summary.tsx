import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Trash2 } from "lucide-react";

export interface CartItem {
    unique_id: string; // Pour identifier la ligne (produit_id + variant_id)
    product_id: number;
    variant_id: number | null;
    name: string | undefined;
    quantity: number;
    price: number;
}

interface CartSummaryProps {
    items: CartItem[];
    onUpdateQuantity: (uniqueId: string, newQty: number) => void;
    onRemove: (uniqueId: string) => void;
}

export function CartSummary({ items, onUpdateQuantity, onRemove }: CartSummaryProps) {
    const formatCurrency = useCurrencyFormatter();

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (items.length === 0) {
        return (
            <div className="text-center p-6 border border-dashed rounded-lg text-gray-500">
                Le panier est vide. Ajoutez des produits depuis la table ci-dessus.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* En-tête (Masqué sur mobile, visible sur desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 font-semibold text-sm text-gray-500 border-b pb-2">
                <div className="col-span-5">Produit / Variante</div>
                <div className="col-span-3 text-center">Quantité</div>
                <div className="col-span-2 text-right">Prix Unit.</div>
                <div className="col-span-2 text-right">Sous-total</div>
            </div>

            {/* Liste des items */}
            <div className="space-y-2">
                {items.map((item) => (
                    <div
                        key={item.unique_id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded border"
                    >
                        {/* Colonne 1 : Nom (6 parts) */}
                        <div className="col-span-1 md:col-span-4">
                            <span className="font-medium text-sm text-gray-900">{item.name}</span>
                        </div>

                        {/* Colonne 2 : Quantité (2 parts) */}
                        <div className="col-span-1 md:col-span-4 flex items-center justify-between md:justify-center space-x-2">
                            <span className="md:hidden text-sm text-gray-500">Qté:</span>
                            <Input
                                type="number"
                                min={1}
                                className="w-16 h-8 text-center"
                                value={item.quantity}
                                onChange={(e) => {
                                    e.preventDefault();
                                    onUpdateQuantity(item.unique_id, parseInt(e.target.value) || 1)
                                }}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => onRemove(item.unique_id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Colonne 3 : Prix (2 parts) */}
                        <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end text-sm">
                            <span className="md:hidden text-gray-500">Prix:</span>
                            <span>{formatCurrency(item.price)}</span>
                        </div>

                        {/* Colonne 4 : Sous-total (2 parts) */}
                        <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end font-semibold text-sm">
                            <span className="md:hidden text-gray-500">Total:</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total Général */}
            <div className="flex justify-end pt-4 border-t">
                <div className="text-xl font-bold">
                    Total : <span className="text-primary">{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
}
