import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Category } from "@/types";
import { motion } from "framer-motion";

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (categoryName: string) => void;
}

export const CategoryFilter = ({
    categories,
    selectedCategory,
    onSelectCategory,
}: CategoryFilterProps) => {
    // Création de la liste des onglets : "Tous" + les noms des catégories actives
    const tabs = ["Tous", ...categories.map((c) => c.name)];

    return (
        <div className="w-full">
            <div className="container max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar mask-gradient-x">
                    {tabs.map((tab) => {
                        const isSelected = selectedCategory === tab;
                        return (
                            <div key={tab} className="relative flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSelectCategory(tab)}
                                    className={cn(
                                        "relative z-10 h-10 px-5 rounded-full text-sm font-medium transition-colors duration-300",
                                        isSelected
                                            ? "text-primary-foreground hover:bg-transparent"
                                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                                    )}
                                >
                                    {tab}
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
