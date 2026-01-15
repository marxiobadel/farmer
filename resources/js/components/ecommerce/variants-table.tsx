import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useCurrencyFormatter } from "@/hooks/use-currency";

interface ProductVariantsTableProps {
    product: Product;
    onAddToCart: (variantId: number | null, price: number, nameSuffix?: string) => void;
}

export function ProductVariantsTable({ product, onAddToCart }: ProductVariantsTableProps) {
    const formatCurrency = useCurrencyFormatter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const hasVariants = product.variants && product.variants.length > 0;

    // --- CAS 1 : PRODUIT SIMPLE (SANS VARIANTES) ---
    if (!hasVariants) {
        return (
            <div className="p-4 border rounded bg-gray-50 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Produit standard (Sans variantes)</p>
                    <p className="text-sm text-gray-600">Stock : {product.quantity}</p>
                    <p className="text-lg font-bold mt-1">{formatCurrency(product.base_price)}</p>
                </div>
                <Button
                    type="button"
                    onClick={() => onAddToCart(null, product.base_price)}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" /> Ajouter
                </Button>
            </div>
        );
    }

    // --- CAS 2 : PRODUIT AVEC VARIANTES (PAGINÉ) ---
    const totalVariants = product.variants!.length;
    const totalPages = Math.ceil(totalVariants / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVariants = product.variants!.slice(startIndex, endIndex);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border mb-4">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-2 border">SKU</th>
                        <th className="p-2 border">Options</th>
                        <th className="p-2 border">Prix</th>
                        <th className="p-2 border">Stock</th>
                        <th className="p-2 border text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentVariants.map((v) => {
                        // Création du nom de la variante (ex: "Rouge, XL")
                        const variantName = v.options.map((o) => `${o.option}`).join(" / ");

                        return (
                            <tr key={v.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-2 border">{v.sku}</td>
                                <td className="p-2 border font-medium">{variantName}</td>
                                <td className="p-2 border">{formatCurrency(v.price)}</td>
                                <td className="p-2 border">{v.quantity}</td>
                                <td className="p-2 border text-center">
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="secondary"
                                        onClick={() => onAddToCart(v.id, v.price, variantName)}
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Ajouter
                                    </Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Pagination (inchangée) */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {startIndex + 1}-{Math.min(endIndex, totalVariants)} sur {totalVariants}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            type="button"
                            onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">Page {currentPage}/{totalPages}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            type="button"
                            onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
