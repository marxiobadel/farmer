import { useRef } from "react";
import { motion } from "framer-motion";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
    categories: Category[];
    categoryCounts?: Record<string, number>;
    selectedCategory: string;
    onSelectCategory: (categoryName: string) => void;
}

export const CategoryFilter = ({
    categories,
    categoryCounts = {},
    selectedCategory,
    onSelectCategory,
}: CategoryFilterProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Tab list starting with 'Tous'
    const tabs = ["Tous", ...categories.map((c) => c.name)];

    const handleTabClick = (tab: string, e: React.MouseEvent<HTMLButtonElement>) => {
        onSelectCategory(tab);
        // Smooth scroll the active tab to center on mobile viewports
        e.currentTarget.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    };

    return (
        <div className="relative w-full">
            {/* Visual fading masks for scroll overflowing on touch screens */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-r from-background to-transparent sm:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-l from-background to-transparent sm:hidden" />

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div
                    ref={scrollContainerRef}
                    role="tablist"
                    aria-label="Filtrer les produits par catégorie"
                    className="flex items-center gap-2 overflow-x-auto py-3.5 scrollbar-none [-webkit-overflow-scrolling:touch]"
                >
                    {tabs.map((tab) => {
                        const isSelected = selectedCategory === tab;
                        const count = categoryCounts[tab];

                        return (
                            <button
                                key={tab}
                                role="tab"
                                aria-selected={isSelected}
                                onClick={(e) => handleTabClick(tab, e)}
                                className={cn(
                                    "group relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    isSelected
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                )}
                            >
                                {/* Active Indicator Backdrop Pill */}
                                {isSelected && (
                                    <motion.div
                                        layoutId="activeCategoryPill"
                                        className="absolute inset-0 z-0 rounded-full bg-primary shadow-sm shadow-primary/25"
                                        transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                                    />
                                )}

                                {/* Tab Label */}
                                <span className="relative z-10">{tab}</span>

                                {/* Dynamic Count Badge */}
                                {typeof count === "number" && (
                                    <span
                                        className={cn(
                                            "relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors leading-none",
                                            isSelected
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
