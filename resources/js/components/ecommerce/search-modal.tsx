import { useEffect, useState } from "react";
import { Link } from "@inertiajs/react";
import { Search, Loader2, X, ChevronRight, PackageSearch } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import type { Product } from "@/types";
import axiosInstance from "@/bootstrap";
import routeProducts from "@/routes/products";

interface SearchModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SearchModal = ({ isOpen, onOpenChange }: SearchModalProps) => {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const formatCurrency = useCurrencyFormatter();

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setProducts([]);
            return;
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim().length >= 2) {
                performSearch(query.trim());
            } else {
                setProducts([]);
            }
        }, 350);

        return () => clearTimeout(handler);
    }, [query]);

    const performSearch = async (searchQuery: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(routeProducts.search().url, {
                params: { q: searchQuery },
            });
            setProducts(response.data.results ?? []);
        } catch (error) {
            console.error("Search error:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="top-[15%] translate-y-0 sm:max-w-xl gap-0 p-0 overflow-hidden border-border bg-card shadow-2xl rounded-2xl">
                <DialogHeader className="border-b border-border px-4 py-3">
                    <DialogTitle className="sr-only">Rechercher</DialogTitle>
                    <div className="relative flex items-center w-full">
                        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher des œufs, calibres, volailles..."
                            className="h-11 w-full border-0 bg-transparent pl-9 pr-16 text-sm text-foreground focus-visible:ring-0 shadow-none placeholder:text-muted-foreground"
                            autoFocus
                        />
                        <div className="absolute right-2 flex items-center gap-1.5">
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            {query && !isLoading && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[380px] p-2">
                    {isLoading && products.length === 0 && (
                        <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            Recherche en cours...
                        </div>
                    )}

                    {!isLoading && query.length >= 2 && products.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            <PackageSearch className="mx-auto h-8 w-8 opacity-30 mb-2" />
                            <p className="text-sm font-medium text-foreground">Aucun produit trouvé</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Essayez avec un mot-clé comme "calibre", "bio" ou "frais".
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        {products.map((product) => {
                            const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
                            const price = defaultVariant ? defaultVariant.price : product.base_price;
                            const img = defaultVariant?.image || product.default_image;
                            const variantName = defaultVariant?.options?.map((opt) => opt.option).join(" / ");

                            return (
                                <Link
                                    key={product.id}
                                    href={routeProducts.show(product.slug)}
                                    onClick={() => onOpenChange(false)}
                                    className="group flex items-center gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-accent/60"
                                >
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                        <img
                                            src={img || `https://placehold.co/60?text=${encodeURIComponent(product.name)}`}
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-semibold text-foreground truncate">
                                            {product.name}
                                            {variantName && <span className="ml-1.5 text-xs font-normal text-muted-foreground">({variantName})</span>}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {product.categories?.[0]?.name || "Boutique"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-primary">{formatCurrency(price)}</div>
                                        {product.quantity <= 0 && (
                                            <span className="text-[10px] font-semibold text-destructive">Épuisé</span>
                                        )}
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground" />
                                </Link>
                            );
                        })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
