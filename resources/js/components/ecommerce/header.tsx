import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Tractor, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Cart, SharedData } from "@/types";
import { CartSheet } from "./cart-sheet";
import { UserProfileMenu } from "./user-profile-menu";
import { MobileMenu } from "./mobile-menu";
import { SearchModal } from "./search-modal";
import products from "@/routes/products";
import { about, contact, farming } from "@/routes";

export const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Nos Produits", href: products.index().url },
    { label: "Notre Élevage", href: farming().url },
    { label: "À propos", href: about().url },
    { label: "Contact", href: contact().url },
];

export const Header = () => {
    const { name, cart } = usePage<SharedData>().props;
    const { url } = usePage();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Global keyboard shortcut for search (⌘K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const totalCartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* --- LEFT: LOGO --- */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
                                <Tractor className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base sm:text-lg font-black tracking-tight text-foreground leading-none">
                                    {name || "MontView"}
                                </span>
                                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                                    Ferme Avicole
                                </span>
                            </div>
                        </Link>

                        {/* --- DESKTOP NAV LINKS --- */}
                        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
                            {navItems.map((item) => {
                                const isActive = item.href === "/" ? url === "/" : url.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`rounded-full px-3.5 py-1.5 transition-all duration-200 ${isActive
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* --- RIGHT: ACTIONS --- */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5">

                        {/* Quick Search Trigger (Faux-input on md+, icon on xs/sm) */}
                        <Button
                            variant="outline"
                            onClick={() => setSearchOpen(true)}
                            className="group relative h-9 w-9 p-0 md:h-9 md:w-56 md:justify-between md:px-3 rounded-full border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground shadow-xs"
                        >
                            <span className="flex items-center gap-2">
                                <Search className="h-4 w-4 shrink-0 transition-colors group-hover:text-primary" />
                                <span className="hidden md:inline text-xs font-normal">Rechercher un produit...</span>
                            </span>
                            <kbd className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </Button>

                        {/* Cart Sheet */}
                        <CartSheet cart={cart as Cart} totalCount={totalCartCount} />

                        {/* Desktop User Profile */}
                        <div className="hidden lg:block">
                            <UserProfileMenu />
                        </div>

                        {/* Mobile Menu Trigger */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden h-9 w-9 rounded-full text-foreground hover:bg-accent"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Global Search Dialog */}
            <SearchModal isOpen={searchOpen} onOpenChange={setSearchOpen} />

            {/* Responsive Mobile Drawer */}
            <MobileMenu isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
        </>
    );
};
