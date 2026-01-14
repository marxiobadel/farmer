import { CategoryFilter } from "@/components/ecommerce/category-filter";
import { FeaturesSection } from "@/components/ecommerce/features-section";
import { HeroSection } from "@/components/ecommerce/hero-section";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import { TestimonialsSection } from "@/components/ecommerce/testimonials-section";
import AppLayout from "@/layouts/app-layout";
import pro from "@/routes/pro";
import { Category, Product } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

// Extension locale pour typer les données brutes du backend
interface HomeCategory extends Category {
    products: Product[];
}

interface PageProps {
    categories: HomeCategory[];
    canRegister: boolean;
}

export default function Index({ categories, canRegister }: PageProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("Tous");

    const allProducts = useMemo(() => {
        return categories.flatMap(category =>
            category.products.map(prod => {
                return { ...prod, category_name: category.name };
            })
        );
    }, [categories]);

    const displayedProducts = useMemo(() => {
        if (selectedCategory === "Tous") {
            return allProducts;
        }
        return allProducts.filter((p: any) => p.category_name === selectedCategory);
    }, [selectedCategory, allProducts]);

    return (
        <AppLayout layout="guest">
            <Head title="L'Excellence Avicole" />
            <HeroSection />

            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm transition-all">
                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            </div>

            <div className="bg-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />
                <div className="relative z-10">
                    <ProductGrid
                        products={displayedProducts}
                        selectedCategoryName={selectedCategory}
                    />
                </div>
            </div>

            <TestimonialsSection />
            <FeaturesSection />

            {/* Section Call to Action B2B */}
            <section className="relative isolate overflow-hidden bg-amber-600 py-16 sm:py-24">
               {/* ... (Le reste du code de la section reste identique) ... */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                    >
                        Partenaire des professionnels de l'alimentation
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90"
                    >
                        Hôtels, restaurants, boulangeries : sécurisez votre chaîne d'approvisionnement avec des œufs frais calibrés et livrés quotidiennement.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-10 flex items-center justify-center gap-x-6"
                    >
                        <Link
                            href={pro.index()}
                            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-sm hover:bg-stone-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                        >
                            Ouvrir un compte Pro
                        </Link>
                    </motion.div>
                </div>
            </section>
        </AppLayout>
    );
}
