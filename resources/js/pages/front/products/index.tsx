import AppLayout from "@/layouts/app-layout";
import { Head, router, Link, usePage } from "@inertiajs/react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ProductCard } from "@/components/ecommerce/product-card";
import { debounce } from "lodash";
import productsRoutes from "@/routes/products";
import { SharedData } from "@/types";

// --- TYPES ---
interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    base_price: number;
    image_url: string;
    category?: string;
    // Ajoutez d'autres champs selon votre Resource
}

interface MetaLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface ProductCollection {
    data: Product[];
    meta: {
        links: MetaLink[];
        total: number;
        from: number;
        to: number;
    };
}

interface Props {
    products: ProductCollection;
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        sort?: string;
        min_price?: string;
        max_price?: string;
    };
    priceRange: {
        min: number;
        max: number;
    };
}

export default function ShopIndex({ products, categories, filters, priceRange }: Props) {
    const { defaultCurrency } = usePage<SharedData>().props;

    // États locaux pour la gestion fluide des inputs
    const [search, setSearch] = useState(filters.search || "");
    const [price, setPrice] = useState([
        Number(filters.min_price) || priceRange.min,
        Number(filters.max_price) || priceRange.max
    ]);

    // Fonction principale de mise à jour des filtres URL
    const updateParams = useCallback((newParams: Record<string, any>) => {
        router.get(productsRoutes.index().url, {
            ...filters,
            ...newParams
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, [filters]);

    // Debounce pour la recherche et le slider prix (éviter trop de requêtes)
    const debouncedSearch = useCallback(
        debounce((value: string) => updateParams({ search: value || null, page: 1 }), 500),
        []
    );

    const debouncedPrice = useCallback(
        debounce((val: number[]) => updateParams({ min_price: val[0], max_price: val[1], page: 1 }), 500),
        []
    );

    // Handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handlePriceChange = (val: number[]) => {
        setPrice(val);
        debouncedPrice(val);
    };

    const clearFilters = () => {
        setSearch("");
        setPrice([priceRange.min, priceRange.max]);
        router.get(productsRoutes.index().url);
    };

    return (
        <AppLayout layout="guest">
            <Head title="Nos Produits" />

            {/* --- HERO SECTION --- */}
            <div className="bg-stone-900 relative overflow-hidden isolate h-64 flex items-center">
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950 to-stone-900" />
                {/* Pattern décoratif */}
                <svg className="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                    <defs>
                        <pattern id="shop-pattern" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
                            <path d="M.5 200V.5H200" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth={0} fill="url(#shop-pattern)" />
                </svg>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-white font-serif mb-2">
                            La Boutique <span className="text-primary">Fermière</span>
                        </h1>
                        <p className="text-stone-400 text-lg max-w-2xl">
                            Des produits frais, locaux et de qualité supérieure, livrés chez vous.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="bg-stone-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* --- SIDEBAR (Desktop) --- */}
                        <aside className="hidden lg:block w-72 flex-shrink-0 space-y-8">
                            {/* Recherche */}
                            <div className="bg-white p-5 rounded-2xl border border-stone-200">
                                <h3 className="font-bold text-stone-900 mb-4 font-serif">Recherche</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                                    <Input
                                        placeholder="Oeufs, Poulet..."
                                        className="pl-9 bg-stone-50 border-stone-200 focus:border-primary focus:ring-primary"
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>

                            {/* Catégories */}
                            <div className="bg-white p-5 rounded-2xl border border-stone-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-stone-900 font-serif">Catégories</h3>
                                    {filters.category && (
                                        <button onClick={() => updateParams({ category: null })} className="text-xs text-red-500 hover:underline">
                                            Effacer
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => updateParams({ category: null })}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!filters.category ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-50'}`}
                                    >
                                        Tous les produits
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => updateParams({ category: cat.slug })}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${filters.category === cat.slug ? 'bg-primary/10 text-primary' : 'text-stone-600 hover:bg-stone-50'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prix Slider */}
                            <div className="bg-white p-5 rounded-2xl border border-stone-200">
                                <h3 className="font-bold text-stone-900 mb-6 font-serif">Budget ({defaultCurrency})</h3>
                                <Slider
                                    defaultValue={[priceRange.min, priceRange.max]}
                                    min={priceRange.min}
                                    max={priceRange.max}
                                    step={100}
                                    value={price}
                                    onValueChange={handlePriceChange}
                                    className="mb-6"
                                />
                                <div className="flex items-center justify-between text-sm text-stone-600 font-medium">
                                    <span>{price[0].toLocaleString()} F</span>
                                    <span>{price[1].toLocaleString()} F</span>
                                </div>
                            </div>
                        </aside>

                        {/* --- MAIN CONTENT --- */}
                        <div className="flex-1">

                            {/* Toolbar Mobile & Tri */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-stone-200">

                                {/* Mobile Filter Trigger */}
                                <div className="lg:hidden w-full sm:w-auto">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" className="w-full flex gap-2 border-stone-300">
                                                <SlidersHorizontal className="h-4 w-4" /> Filtres
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left">
                                            <SheetHeader>
                                                <SheetTitle>Filtres</SheetTitle>
                                                <SheetDescription>Affinez votre recherche</SheetDescription>
                                            </SheetHeader>
                                            <div className="mt-8 space-y-6">
                                                <Input
                                                    placeholder="Rechercher..."
                                                    value={search}
                                                    onChange={handleSearchChange}
                                                />
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Catégories</label>
                                                    <div className="grid gap-2">
                                                        {categories.map(cat => (
                                                            <Button
                                                                key={cat.id}
                                                                variant={filters.category === cat.slug ? "default" : "outline"}
                                                                className="justify-start"
                                                                onClick={() => updateParams({ category: cat.slug })}
                                                            >
                                                                {cat.name}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>

                                {/* Compteur Résultats */}
                                <p className="text-sm text-stone-500">
                                    Affichage de <span className="font-bold text-stone-900">{products.meta.from}-{products.meta.to}</span> sur {products.meta.total} résultats
                                </p>

                                {/* Tri */}
                                <div className="w-full sm:w-[200px]">
                                    <Select
                                        value={filters.sort || "newest"}
                                        onValueChange={(val) => updateParams({ sort: val })}
                                    >
                                        <SelectTrigger className="border-stone-200">
                                            <SelectValue placeholder="Trier par" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Nouveautés</SelectItem>
                                            <SelectItem value="oldest">Plus anciens</SelectItem>
                                            <SelectItem value="price_asc">Prix croissant</SelectItem>
                                            <SelectItem value="price_desc">Prix décroissant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Active Filters Chips */}
                            {(filters.category || filters.search || filters.min_price) && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {filters.category && (
                                        <Badge variant="secondary" className="px-3 py-1 flex gap-2 items-center bg-white border border-stone-200">
                                            Catégorie: {categories.find(c => c.slug === filters.category)?.name}
                                            <button onClick={() => updateParams({ category: null })}><X className="h-3 w-3" /></button>
                                        </Badge>
                                    )}
                                    {filters.min_price && (
                                        <Badge variant="secondary" className="px-3 py-1 flex gap-2 items-center bg-white border border-stone-200">
                                            Prix: {filters.min_price}F - {filters.max_price}F
                                            <button onClick={() => updateParams({ min_price: null, max_price: null })}><X className="h-3 w-3" /></button>
                                        </Badge>
                                    )}
                                    <button onClick={clearFilters} className="text-xs text-stone-500 underline hover:text-stone-800 ml-2">
                                        Tout effacer
                                    </button>
                                </div>
                            )}

                            {/* Product Grid */}
                            {products.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-stone-200">
                                    <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="h-8 w-8 text-stone-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900">Aucun produit trouvé</h3>
                                    <p className="text-stone-500 mt-1 max-w-sm mx-auto">
                                        Essayez de modifier vos filtres ou effectuez une nouvelle recherche.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="mt-6"
                                    >
                                        Voir tous les produits
                                    </Button>
                                </div>
                            )}

                            {/* Pagination */}
                            {products.meta.links.length > 3 && (
                                <div className="mt-12 flex justify-center gap-2">
                                    {products.meta.links.map((link, i) => (
                                        link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${link.active
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={i}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-stone-300 border border-stone-100 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
