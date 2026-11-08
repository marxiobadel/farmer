import { useMemo, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2,
    Truck,
    Receipt,
    ArrowRight,
    PhoneCall,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { HeroSection } from "@/components/ecommerce/hero-section";
import { CategoryFilter } from "@/components/ecommerce/category-filter";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import { FeaturesSection } from "@/components/ecommerce/features-section";
import { TestimonialsSection } from "@/components/ecommerce/testimonials-section";
import { Button } from "@/components/ui/button";
import pro from "@/routes/pro";
import { contact } from "@/routes";
import { Category, Product, SharedData } from "@/types";
import { LeadDiscountModal } from "@/components/ecommerce/lead-discount-modal";

export interface EnrichedProduct extends Product {
    category_name: string;
}

interface HomeCategory extends Category {
    products: Product[];
}

interface PageProps {
    categories: HomeCategory[];
    canRegister: boolean;
}

export default function Index({ categories }: PageProps) {
    const { url } = usePage();
    const { name, settings } = usePage<SharedData>().props;
    const siteName = name || "MontView";

    const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

    // Aplatissement du catalogue
    const allProducts = useMemo<EnrichedProduct[]>(() => {
        return categories.flatMap((category) =>
            (category.products || []).map((prod) => ({
                ...prod,
                category_name: category.name,
            }))
        );
    }, [categories]);

    // Compteurs par catégorie
    const categoryCounts = useMemo<Record<string, number>>(() => {
        const counts: Record<string, number> = { Tous: allProducts.length };
        categories.forEach((cat) => {
            counts[cat.name] = (cat.products || []).length;
        });
        return counts;
    }, [categories, allProducts]);

    // Produits filtrés
    const displayedProducts = useMemo(() => {
        if (selectedCategory === "Tous") {
            return allProducts;
        }
        return allProducts.filter((p) => p.category_name === selectedCategory);
    }, [selectedCategory, allProducts]);

    // --- PARAMÈTRES SEO & JSON-LD SCHEMA.ORG ---
    const canonicalUrl = typeof window !== "undefined" ? window.location.origin + url : "";
    const pageTitle = `${siteName} | Œufs Frais du Jour & Élevage Avicole Local`;
    const metaDescription =
        "Ferme avicole éco-responsable. Production locale d'œufs frais calibrés (L, XL), volailles élevées au grain naturel sans antibiotiques. Vente aux particuliers, hôtels et restaurants avec livraison express en 24h.";
    const ogImageUrl = typeof window !== "undefined" ? `${window.location.origin}/images/logo_with_bg.png` : "/images/logo_with_bg.png";

    // Schéma Entreprise Agricole / Magasin local
    const schemaLocalBusiness = {
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "Store"],
        "@id": `${canonicalUrl}#organization`,
        name: siteName,
        alternateName: "MontView Agro & Élevage",
        description: metaDescription,
        url: canonicalUrl,
        telephone: settings.phone ?? "+237658265032",
        priceRange: "FCFA",
        currenciesAccepted: "XAF",
        paymentAccepted: "Cash, Mobile Money (MTN, Orange Money), Virement",
        areaServed: ["Yaoundé", "Douala", "Bangangté", "Région du Centre", "Cameroun"],
        address: {
            "@type": "PostalAddress",
            addressCountry: "CM",
            addressLocality: "Bangangté",
        },
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                opens: "06:30",
                closes: "18:00",
            },
        ],
    };

    // Schéma Navigation / Moteur de recherche de site
    const schemaWebSite = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: siteName,
        inLanguage: "fr-FR",
        potentialAction: {
            "@type": "SearchAction",
            target: `${canonicalUrl}/products?q={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };

    // Schéma Carrousel de Produits Principaux
    const schemaProductCatalog = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: allProducts.slice(0, 8).map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Product",
                name: product.name,
                image: product.default_image || ogImageUrl,
                description: `${product.name} - Production fraîche locale certifiée qualité supérieure.`,
                offers: {
                    "@type": "Offer",
                    price: product.base_price,
                    priceCurrency: "XAF",
                    availability:
                        product.quantity > 0
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock",
                },
            },
        })),
    };

    return (
        <AppLayout layout="guest">
            <Head>
                {/* Titre & Balises Essentielles */}
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta
                    name="keywords"
                    content="œufs frais, ferme avicole, oeufs calibre L, oeufs calibre XL, volaille locale, vente oeufs gros, élevage poules pondeuses, cameroun, yaoundé, douala"
                />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                <link rel="canonical" href={canonicalUrl} />

                {/* Local SEO & Géo-référencement */}
                <meta name="geo.region" content="CM-CE" />
                <meta name="geo.placename" content="Bangangté" />
                <meta name="author" content={siteName} />

                {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={ogImageUrl} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Ferme Avicole MontView - Production d'œufs frais et volailles" />
                <meta property="og:locale" content="fr_FR" />

                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={ogImageUrl} />

                {/* Données Structurées JSON-LD (Schema.org) */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaLocalBusiness)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(schemaWebSite)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(schemaProductCatalog)}
                </script>
            </Head>

            <LeadDiscountModal delaySeconds={5} />

            {/* Main Hero Section */}
            <HeroSection />

            {/* Sticky Category Bar with Dynamic Glassmorphism */}
            <div className="sticky top-16 z-30 w-full border-b border-border/80 bg-background/80 backdrop-blur-lg transition-colors supports-[backdrop-filter]:bg-background/60">
                <CategoryFilter
                    categories={categories}
                    categoryCounts={categoryCounts}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            </div>

            {/* Catalog Display Section */}
            <section className="relative min-h-[450px] bg-background py-10 sm:py-16 md:py-20 lg:pb-24">
                {/* Soft background ambient gradient */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
                    <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-accent/40 blur-[100px]" />
                </div>

                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCategory}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                            <ProductGrid
                                products={displayedProducts}
                                selectedCategoryName={selectedCategory}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* Trust & Social Proof Elements */}
            <TestimonialsSection />
            <FeaturesSection />

            {/* B2B Partnership Call To Action */}
            <section className="relative isolate overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 py-16 sm:py-24 text-white">
                {/* Fine Radial Grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />

                <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Pill Header */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 backdrop-blur-md"
                        >
                            <Building2 className="h-3.5 w-3.5 text-amber-400" />
                            Restauration, Hôtellerie & Métiers de Bouche
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
                        >
                            Sécurisez votre approvisionnement avicole en gros volume
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 text-base sm:text-lg leading-relaxed text-stone-300"
                        >
                            Profitez de grilles tarifaires dégressives, d'une logistique quotidienne garantie en véhicule réfrigéré et d'une traçabilité sanitaire totale adaptée aux audits HACCP.
                        </motion.p>
                    </div>

                    {/* Key B2B Differentiators Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
                    >
                        {[
                            {
                                icon: Truck,
                                title: "Livraison 6j/7 avant 8h",
                                desc: "Tournées matinales dédiées aux professionnels de la restauration.",
                            },
                            {
                                icon: Receipt,
                                title: "Facturation groupée 30j",
                                desc: "Paiement à terme, relevé mensuel et intégration comptable simplifiée.",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Certificats sanitaires",
                                desc: "Fiches de lots et dates de ponte gravées pour vos registres d'hygiène.",
                            },
                        ].map((perk, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xs sm:items-start sm:text-left"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                                    <perk.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-white">{perk.title}</h3>
                                <p className="mt-1 text-xs text-stone-400 leading-relaxed">{perk.desc}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* Action CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button
                            asChild
                            size="lg"
                            className="h-13 w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Link href={pro.index()}>
                                Ouvrir un compte Pro
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-13 w-full sm:w-auto rounded-full border-stone-700 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                            <Link href={contact().url}>
                                <PhoneCall className="mr-2 h-4 w-4 text-amber-400" />
                                Échanger avec un commercial
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Reassurance Micro-Copy */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            Sans engagement de durée
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            Tarifs dégressifs dès 10 plateaux
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            Support réactif 7j/7
                        </span>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
