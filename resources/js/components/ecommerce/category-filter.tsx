import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/ecommerce";
import { usePage } from "@inertiajs/react";
import { motion } from "framer-motion";

interface CategoryFilterProps {
    selectedCategory: Category;
    onSelectCategory: (category: Category) => void;
}

const categories: Category[] = [
    "Tous",
    "Œufs de Table",
    "Poules Pondeuses",
    "Poussins",
    "Aliments & Matériel",
    "Produits Fermiers"
];

export const CategoryFilter = ({
    selectedCategory,
    onSelectCategory,
}: CategoryFilterProps) => {
    const props = usePage().props;

    console.log(props.categories);
    return (
        <div className="w-full">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar mask-gradient-x">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <div key={cat} className="relative">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSelectCategory(cat)}
                                    className={cn(
                                        "relative z-10 h-10 px-5 rounded-full text-sm font-medium transition-colors duration-300",
                                        isSelected
                                            ? "text-primary-foreground hover:bg-transparent"
                                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                                    )}
                                >
                                    {cat}
                                </Button>
                                {isSelected && (
                                    <motion.div
                                        layoutId="activeCategory"
                                        className="absolute inset-0 z-0 rounded-full bg-primary shadow-md shadow-primary/25"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
