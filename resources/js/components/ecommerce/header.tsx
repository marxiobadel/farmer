import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, usePage } from "@inertiajs/react";
import { Search, Tractor, ChevronRight } from "lucide-react";
import type { Cart, SharedData } from "@/types";
import { CartSheet } from "./mini-cart";
import { MenuProfile, navItems } from "./menu-profile";

export const Header = () => {
    const { name, cart } = usePage<SharedData>().props;

    const mockSearchResults = [
        { id: 1, name: "Plateau d'oeufs frais (30)", category: "Oeufs", price: "2 500 FCFA", image: "https://placehold.co/100?text=Oeufs", status: "En stock" },
        { id: 2, name: "Poule Pondeuse Lohmann", category: "Volailles", price: "4 000 FCFA", image: "https://placehold.co/100?text=Poule", status: "En stock" },
    ];

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
                    <Dialog>
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
                                    />
                                </div>
                            </DialogHeader>
                            <ScrollArea className="max-h-[400px] overflow-y-auto">
                                <div className="p-2 flex flex-col gap-1">
                                    {mockSearchResults.map((product) => (
                                        <Link key={product.id} href={`/produits/${product.id}`} className="group flex items-center gap-4 p-2 rounded-lg hover:bg-stone-100 transition-colors">
                                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-white">
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-stone-900 truncate">{product.name}</h4>
                                                <p className="text-xs text-stone-500 truncate">{product.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-primary">{product.price}</p>
                                                {product.status === "Rupture" && <span className="text-[10px] text-red-500 font-medium">Épuisé</span>}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500" />
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>

                    {/* --- PANIER --- */}
                    <CartSheet cart={cart as Cart} />

                    <MenuProfile />
                </div>
            </div>
        </header>
    );
};
