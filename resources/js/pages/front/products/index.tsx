import AppLayout from "@/layouts/app-layout";
import { Head, router, Link } from "@inertiajs/react";
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
import { ProductCard } from "@/components/ecommerce/product-card";
import { debounce } from "lodash";
import productsRoutes from "@/routes/products";
import { Category, Product } from "@/types";
import { adaptProductToCard } from "@/lib/utils";

// --- TYPES ---

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
    };
}

export default function ShopIndex({ products, categories, filters }: Props) {
    // États locaux pour la gestion fluide de l'input de recherche
    const [search, setSearch] = useState(filters.search || "");

    // Fonction principale de mise à jour des filtres URL
    const updateParams = useCallback((newParams: Record<string, any>) => {
        router.get(productsRoutes.index().url, {
            ...filters,
            ...newParams
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Utiliser replace pour ne pas empiler l'historique
            except: ['categories'] // Ne pas recharger les catégories
        });
    }, [filters]);

    // Debounce pour la recherche uniquement
    const debouncedSearch = useCallback(
        debounce((value: string) => updateParams({ search: value || null, page: 1 }), 500),
        []
    );

    // Handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const clearFilters = () => {
        setSearch("");
        router.get(productsRoutes.index().url);
    };

    const adaptedProducts = products.data.map(adaptProductToCard);

    return (
        <AppLayout layout="guest">
            <Head title="Nos Produits" />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-stone-900 overflow-hidden isolate">
                {/* Fond décoratif (Gradient et Pattern uniquement, pas d'image) */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 opacity-90" />
                    <svg className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                        <defs>
                            <pattern id="shop-pattern" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" strokeWidth={0} fill="url(#shop-pattern)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                            }}
                        >
                            {/* Badge */}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                }}
                                className="flex justify-center mb-6"
                            >
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                                    Direct Producteur
                                </span>
                            </motion.div>

                            {/* Titre */}
                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                }}
                                className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-serif"
                            >
                                La Boutique <span className="text-primary">Fermière</span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                }}
                                className="mt-6 text-lg leading-8 text-stone-300"
                            >
                                Des produits frais, locaux et de qualité supérieure, livrés chez vous.
                            </motion.p>
                        </motion.div>
                    </div>
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

                            {/* Suppression du widget Prix Slider ici */}
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
                                            <div className="mt-4 px-4 space-y-6">
                                                <Input
                                                    placeholder="Rechercher..."
                                                    value={search}
                                                    onChange={handleSearchChange}
                                                />
                                                <div className="space-y-4">
                                                    <label className="text-sm font-medium">Catégories</label>
                                                    <div className="grid gap-2 mt-4">
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
                            {(filters.category || filters.search) && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {filters.category && (
                                        <Badge variant="secondary" className="px-3 py-1 flex gap-2 items-center bg-white border border-stone-200">
                                            Catégorie: {categories.find(c => c.slug === filters.category)?.name}
                                            <button onClick={() => updateParams({ category: null })}><X className="h-3 w-3" /></button>
                                        </Badge>
                                    )}
                                    {/* Suppression du badge min_price/max_price */}
                                    <button onClick={clearFilters} className="text-xs text-stone-500 underline hover:text-stone-800 ml-2">
                                        Tout effacer
                                    </button>
                                </div>
                            )}

                            {/* Product Grid */}
                            {adaptedProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {adaptedProducts.map(adaptedProduct => (
                                        <div key={adaptedProduct.id}>
                                            {/* @ts-ignore - Les types correspondent via l'adaptateur mais TS peut être strict */}
                                            <ProductCard product={adaptedProduct} />
                                        </div>
                                    ))}
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
