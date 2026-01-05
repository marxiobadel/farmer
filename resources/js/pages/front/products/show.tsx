import AppLayout from '@/layouts/app-layout';
import { ProductCard } from '@/components/ecommerce/product-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrencyFormatter } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Heart, Minus, Plus, Share2, ShieldCheck, ShoppingBasket, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import products from '@/routes/products';
import FavoriteButton from '@/components/ecommerce/favorite-button';
import carts from '@/routes/carts';

// Adaptateur pour le composant ProductCard qui utilise un type légèrement différent
interface ProductCardData {
    id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    origin: string;
    image: string;
    isAvailable: boolean;
    slug: string;
}

interface PageProps {
    product: Product;
    related: Product[];
}

export default function ProductShow({ product, related }: PageProps) {
    const formatPrice = useCurrencyFormatter();

    const [adding, setAdding] = useState(false);

    // --- 1. INITIALISATION DE L'ÉTAT (Basé sur l'URL ou les défauts) ---

    // Fonction utilitaire pour parser les paramètres URL au montage
    const getInitialOptions = (): Record<number, number> => {
        const params = new URLSearchParams(window.location.search);
        const initialOptions: Record<number, number> = {};
        let foundUrlParam = false;

        // On essaie de mapper les params URL (ex: ?poids=10kg) aux IDs d'attributs
        product.attributes?.forEach(attr => {
            const paramValue = params.get(attr.name.toLowerCase());
            if (paramValue) {
                const option = attr.options.find(o => o.name.toLowerCase() === paramValue.toLowerCase());
                if (option) {
                    initialOptions[attr.id] = option.id;
                    foundUrlParam = true;
                }
            }
        });

        // Si aucun paramètre URL valide, on fallback sur le variant par défaut
        if (!foundUrlParam && product.variants && product.variants.length > 0) {
            const defaultVariant = product.variants.find(v => v.is_default) || product.variants[0];
            defaultVariant.options.forEach(opt => {
                initialOptions[opt.attribute_id] = opt.attribute_option_id;
            });
        }

        return initialOptions;
    };

    const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>(getInitialOptions);

    // Image active : Priorité à l'image du variant, sinon l'image par défaut
    const [activeImage, setActiveImage] = useState<string>(
        product.default_image || (product.images.length > 0 ? product.images[0].url : `https://placehold.co/600?text=${encodeURIComponent(product.name)}`)
    );

    const [quantity, setQuantity] = useState(1);

    // --- 2. LOGIQUE MÉTIER ---

    // Trouver le variant correspondant à la sélection
    const currentVariant = useMemo(() => {
        if (!product.variants || product.variants.length === 0) return null;
        return product.variants.find(variant => {
            return variant.options.every(opt => selectedOptions[opt.attribute_id] === opt.attribute_option_id);
        });
    }, [product.variants, selectedOptions]);

    // Données calculées
    const displayPrice = currentVariant ? Number(currentVariant.price) : Number(product.base_price);
    const stockQuantity = currentVariant ? currentVariant.quantity : product.quantity;
    const currentSku = currentVariant ? currentVariant.sku : `PROD-${product.id}`;
    const isOutOfStock = stockQuantity <= 0;

    // --- 3. EFFETS DE BORD (URL & Image) ---

    // Mise à jour de l'image quand le variant change (s'il a une image spécifique)
    useEffect(() => {
        if (currentVariant?.image) {
            setActiveImage(currentVariant.image);
        }
    }, [currentVariant]);

    // Synchronisation de l'URL à chaque changement d'option
    useEffect(() => {
        if (Object.keys(selectedOptions).length === 0) return;

        const params = new URLSearchParams(window.location.search);

        // On met à jour les params URL avec les noms lisibles (ex: ?taille=L)
        Object.entries(selectedOptions).forEach(([attrId, optionId]) => {
            const attr = product.attributes?.find(a => a.id === Number(attrId));
            const opt = attr?.options.find(o => o.id === optionId);

            if (attr && opt) {
                params.set(attr.name.toLowerCase(), opt.name);
            }
        });

        // Mise à jour silencieuse de l'URL sans rechargement (History API)
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);

    }, [selectedOptions, product.attributes]);


    // --- 4. HANDLERS ---

    const handleOptionChange = (attributeId: number, optionId: number) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attributeId]: optionId
        }));
    };

    const handleQuantityChange = (type: 'inc' | 'dec') => {
        if (type === 'dec' && quantity > 1) {
            setQuantity(q => q - 1);
        } else if (type === 'inc' && quantity < stockQuantity) {
            setQuantity(q => q + 1);
        }
    };

   const handleAddToCart = () => {
        if (isOutOfStock) return;

        router.post(carts.add().url, {
            product_id: product.id,
            variant_id: currentVariant?.id ?? null,
            quantity: quantity
        }, {
            preserveScroll: true,
            onBefore: () => setAdding(true),
            onFinish: () => setAdding(false),
            onSuccess: () => {
                // Réinitialise la quantité (optionnel) ou garde l'état
                // setQuantity(1);

                toast.success(
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Ajouté au panier !</span>
                        <span className="text-xs text-stone-500">
                            {quantity}x {product.name} ({currentVariant ? 'Variante sélectionnée' : 'Standard'})
                        </span>
                    </div>
                );
            },
            onError: () => {
                toast.error("Impossible d'ajouter le produit au panier. Veuillez réessayer.");
            }
        });
    };

    // Transformation pour les produits similaires (Adapter le type Product global vers le type ProductCard local si besoin)
    const relatedProducts: ProductCardData[] = related.map((p) => {
        let displayPrice = p.base_price;
        let variantName = null;
        let image = p.default_image;
        let availableQty = p.quantity;

        if (p.variants && p.variants.length > 0) {
            const selectedVariant = p.variants.find(v => v.is_default) || p.variants[0];

            // Mise à jour du prix
            displayPrice = selectedVariant.price;

            // Extraction du nom de la variante (ex: "Gros Calibre")
            if (selectedVariant.options && selectedVariant.options.length > 0) {
                variantName = selectedVariant.options.map(opt => opt.option).join(' / ');
            }

            image = selectedVariant.image;
            availableQty = selectedVariant.quantity;
        }

        return {
            id: p.id.toString(),
            name: p.name,
            category: p.categories?.[0]?.name || "Boutique",
            variant_name: variantName,
            price: displayPrice,
            currency: "FCFA", // ou defaultCurrency
            origin: p.origin || "Cameroun",
            image: image || `https://placehold.co/300?text=${encodeURIComponent(p.name)}`,
            isAvailable: availableQty > 0,
            slug: p.slug,
            badge: undefined
        }
    });

    return (
        <AppLayout layout="guest">
            <Head title={product.name} />

            <div className="bg-stone-50 min-h-screen py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- BREADCRUMBS --- */}
                    <nav className="flex items-center text-sm text-stone-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                        <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
                        <span className="mx-2 text-stone-300">/</span>
                        <Link href={products.index()} className="hover:text-primary transition-colors">Boutique</Link>
                        {product.categories && product.categories.length > 0 && (
                            <>
                                <span className="mx-2 text-stone-300">/</span>
                                <Link
                                    href={'#'}
                                    className="hover:text-primary transition-colors"
                                >
                                    {product.categories[0].name}
                                </Link>
                            </>
                        )}
                        <span className="mx-2 text-stone-300">/</span>
                        <span className="font-medium text-stone-900 truncate">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                        {/* --- COLONNE GAUCHE : VISUELS --- */}
                        <div className="flex flex-col gap-4">
                            {/* Image Principale */}
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white border border-stone-200 group">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeImage}
                                        src={activeImage}
                                        alt={product.name}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </AnimatePresence>

                                {/* Badges Flottants */}
                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    {isOutOfStock && <Badge variant="destructive">Rupture de stock</Badge>}
                                    {product.origin && (
                                        <Badge variant="secondary" className="bg-white/90 backdrop-blur text-stone-700 border-stone-200">
                                            <Share2 className="w-3 h-3 mr-1" /> {product.origin}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Galerie de Miniatures */}
                            {product.images && product.images.length > 1 && (
                                <div className="grid grid-cols-5 gap-3">
                                    {product.images.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(img.url)}
                                            className={cn(
                                                "aspect-square rounded-lg overflow-hidden border-2 transition-all relative",
                                                activeImage === img.url
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : "border-transparent hover:border-stone-300"
                                            )}
                                        >
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            {activeImage === img.url && (
                                                <div className="absolute inset-0 bg-primary/10" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- COLONNE DROITE : INFORMATIONS --- */}
                        <div className="flex flex-col">

                            {/* En-tête Produit */}
                            <div className="mb-6 border-b border-stone-200 pb-6">
                                <div className="flex items-start justify-between">
                                    <h1 className="text-3xl font-serif font-bold text-stone-900 leading-tight mb-2">
                                        {product.name}
                                    </h1>
                                    <FavoriteButton product={product} />
                                </div>

                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <span className="text-2xl font-bold text-primary">
                                        {formatPrice(displayPrice)}
                                    </span>
                                    {product.categories?.map(cat => (
                                        <Badge key={cat.id} variant="outline" className="text-stone-500 border-stone-300">
                                            {cat.name}
                                        </Badge>
                                    ))}
                                </div>

                                {product.short_description && (
                                    <p className="mt-4 text-stone-600 leading-relaxed">
                                        {product.short_description}
                                    </p>
                                )}
                            </div>

                            {/* Sélecteur de Variantes */}
                            {product.attributes && product.attributes.length > 0 && (
                                <div className="space-y-6 mb-8">
                                    {product.attributes.map(attr => (
                                        <div key={attr.id}>
                                            <label className="block text-sm font-semibold text-stone-900 mb-3">
                                                {attr.name} : <span className="text-stone-500 font-normal">{attr.options.find(o => o.id === selectedOptions[attr.id])?.name}</span>
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {attr.options.map(option => {
                                                    const isSelected = selectedOptions[attr.id] === option.id;
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => handleOptionChange(attr.id, option.id)}
                                                            className={cn(
                                                                "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 flex items-center gap-2",
                                                                isSelected
                                                                    ? "border-primary bg-primary text-white shadow-sm shadow-primary/20"
                                                                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                                                            )}
                                                        >
                                                            {option.name}
                                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Zone d'Action (Prix, Quantité, Panier) */}
                            <div className="bg-white p-6 rounded-2xl border border-stone-200 mb-8">
                                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mb-6">
                                    {/* Compteur Quantité */}
                                    <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 h-12 w-fit mx-auto sm:mx-0">
                                        <button
                                            onClick={() => handleQuantityChange('dec')}
                                            disabled={quantity <= 1 || isOutOfStock}
                                            className="px-4 h-full text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <div className="w-12 text-center font-bold text-stone-900">{quantity}</div>
                                        <button
                                            onClick={() => handleQuantityChange('inc')}
                                            disabled={quantity >= stockQuantity || isOutOfStock}
                                            className="px-4 h-full text-stone-500 hover:text-stone-900 disabled:opacity-30 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Bouton Panier */}
                                    <Button
                                        size="lg"
                                        className="flex-1 h-12 text-base font-bold shadow-sm shadow-primary/20"
                                        disabled={isOutOfStock || adding}
                                        onClick={handleAddToCart}
                                    >
                                        <ShoppingBasket className="w-5 h-5 mr-2" />
                                        {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
                                    </Button>
                                </div>

                                {/* Infos Stock & SKU */}
                                <div className="space-y-3 text-sm border-t border-stone-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-stone-600">
                                            {isOutOfStock ? (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            )}
                                            <span className={isOutOfStock ? "text-red-600 font-medium" : ""}>
                                                {isOutOfStock
                                                    ? "Non disponible"
                                                    : `${stockQuantity} articles en stock`}
                                            </span>
                                        </div>
                                        {currentSku && (
                                            <div className="text-stone-400 text-xs font-mono">SKU: {currentSku}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Informations Détaillées (Accordéons) */}
                            <Accordion type="single" collapsible className="w-full" defaultValue="desc">
                                <AccordionItem value="desc" className="border-stone-200">
                                    <AccordionTrigger className="text-stone-900 font-semibold hover:no-underline hover:text-primary transition-colors">
                                        Description détaillée
                                    </AccordionTrigger>
                                    <AccordionContent className="text-stone-600 leading-relaxed prose prose-stone max-w-none">
                                        {product.description ? (
                                            <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                        ) : (
                                            "Pas de description supplémentaire."
                                        )}
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="features" className="border-stone-200">
                                    <AccordionTrigger className="text-stone-900 font-semibold hover:no-underline hover:text-primary transition-colors">
                                        Caractéristiques & Livraison
                                    </AccordionTrigger>
                                    <AccordionContent className="text-stone-600 space-y-4">
                                        <ul className="space-y-2 text-sm">
                                            {product.weight && (
                                                <li className="flex justify-between border-b border-dashed border-stone-200 pb-2">
                                                    <span>Poids</span>
                                                    <span className="font-medium text-stone-900">{product.weight} kg</span>
                                                </li>
                                            )}
                                            {product.origin && (
                                                <li className="flex justify-between border-b border-dashed border-stone-200 pb-2">
                                                    <span>Origine</span>
                                                    <span className="font-medium text-stone-900">{product.origin}</span>
                                                </li>
                                            )}
                                        </ul>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="flex gap-3 items-start p-3 bg-stone-50 rounded-lg">
                                                <Truck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-stone-900 text-xs">Livraison Rapide</p>
                                                    <p className="text-[10px] text-stone-500">Expédié sous 24-48h</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 items-start p-3 bg-stone-50 rounded-lg">
                                                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-stone-900 text-xs">Qualité Garantie</p>
                                                    <p className="text-[10px] text-stone-500">Produits frais certifiés</p>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                        </div>
                    </div>

                    {/* --- PRODUITS SIMILAIRES --- */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16 sm:mt-20 md:mt-24 border-t border-stone-200 pt-10 sm:pt-16">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-serif font-bold text-stone-900">
                                    Vous aimerez aussi
                                </h2>
                                <Link href={products.index()} className="text-sm font-medium text-primary hover:underline">
                                    Voir tout
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map(relatedProduct => (
                                    <div key={relatedProduct.id}>
                                        {/* @ts-ignore - Les types correspondent via l'adaptateur mais TS peut être strict */}
                                        <ProductCard product={relatedProduct} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
