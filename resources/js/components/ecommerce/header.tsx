import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, usePage } from "@inertiajs/react";
import { Search, Tractor, ChevronRight, Loader2 } from "lucide-react";
import type { Cart, Product, SharedData } from "@/types";
import { CartSheet } from "./mini-cart";
import { MenuProfile, navItems } from "./menu-profile";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { useEffect, useState } from "react";
import axiosInstance from "@/bootstrap";
import routeProducts from "@/routes/products";

export const Header = () => {
    const { name, cart } = usePage<SharedData>().props;
    const formatCurrency = useCurrencyFormatter();

    // États pour la recherche
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Effet pour gérer la recherche avec un délai (debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim().length > 2) {
                performSearch(query);
            } else {
                setProducts([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const performSearch = async (searchQuery: string) => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(routeProducts.search().url, {
                params: { q: searchQuery }
            });

            setProducts(response.data.results ?? []);
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">

                {/* --- LOGO --- */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <Tractor className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-stone-900 hidden sm:inline-block">
                        {name}
                    </span>
                    <span className="text-xl font-bold tracking-tight text-stone-900 sm:hidden">
                        MontView
                    </span>
                </Link>

                {/* --- NAVIGATION DESKTOP --- */}
                <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 lg:flex">
                    {navItems.map((item) => (
                        <Link key={item.label} href={item.href} className="transition-colors hover:text-primary">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* --- ACTIONS DROITE --- */}
                <div className="flex items-center gap-1 sm:gap-2">

                    {/* --- RECHERCHE --- */}
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-stone-500 hover:text-primary hover:bg-primary/10">
                                <Search className="h-5 w-5" />
                                <span className="sr-only">Rechercher</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] gap-0 p-0 top-[20%] translate-y-0 overflow-hidden">
                            <DialogHeader className="px-4 py-4 border-b">
                                <DialogTitle className="sr-only">Rechercher un produit</DialogTitle>
                                <div className="relative flex items-center w-full">
                                    <Search className="absolute left-3 h-4 w-4 text-stone-500" />
                                    <Input
                                        id="search"
                                        placeholder="Rechercher (ex: oeufs, poules...)"
                                        className="pl-9 h-11 border-0 focus-visible:ring-0 text-base bg-transparent shadow-none"
                                        autoFocus
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                    {isLoading && (
                                        <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-stone-400" />
                                    )}
                                </div>
                            </DialogHeader>
                            <ScrollArea className="xs:w-full max-h-[400px] overflow-y-auto">
                                <div className="p-2 flex flex-col gap-1">
                                    {!isLoading && query.length > 2 && products.length === 0 && (
                                        <div className="py-8 text-center text-sm text-stone-500">
                                            Aucun produit trouvé pour "{query}".
                                        </div>
                                    )}
                                    {products.map((product) => {
                                        let displayPrice = product.base_price;
                                        let variantName = null;
                                        let image = product.default_image;
                                        let availableQty = product.quantity;

                                        if (product.variants && product.variants.length > 0) {
                                            const selectedVariant = product.variants.find(v => v.is_default) || product.variants[0];

                                            // Mise à jour du prix
                                            displayPrice = selectedVariant.price;

                                            // Extraction du nom de la variante (ex: "Gros Calibre")
                                            if (selectedVariant.options && selectedVariant.options.length > 0) {
                                                variantName = selectedVariant.options.map(opt => opt.option).join(' / ');
                                            }

                                            image = selectedVariant.image;
                                            availableQty = selectedVariant.quantity;
                                        }

                                        return (
                                            <Link key={product.id} href={routeProducts.show(product.slug)} className="group flex items-center gap-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                                                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-white">
                                                    <img
                                                        src={image || `https://placehold.co/60?text=${encodeURIComponent(product.name)}`}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-stone-900 truncate">
                                                        {product.name} {variantName && <span className="text-xs text-slate-500">({variantName})</span>}
                                                    </h4>
                                                    <p className="text-xs text-stone-500 truncate">{product.categories?.[0]?.name || "Boutique"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-primary">{formatCurrency(displayPrice)}</p>
                                                    {availableQty <= 0 && <span className="text-[10px] text-red-500 font-medium">Épuisé</span>}
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500" />
                                            </Link>
                                        )
                                    })}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>

                    <CartSheet cart={cart as Cart} />

                    <MenuProfile />
                </div>
            </div>
        </header>
    );
};
