import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link, router, usePage } from "@inertiajs/react";
import { Menu, Search, ShoppingBasket, Tractor, ChevronRight, LogIn, UserPlus, Minus, Plus, Trash2, UserCircle, LogOut, SquareActivity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { about, contact, dashboard, farming, login, logout, register } from "@/routes";
import type { SharedData } from "@/types";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import profile from "@/routes/profile";
import Can from "../can";
import products from "@/routes/products";

export const Header = () => {
    const { name, auth } = usePage<SharedData>().props;

    const navItems = [
        { label: "Nos Produits", href: products.index().url },
        { label: "Elevage", href: farming().url },
        { label: "À propos", href: about().url },
        { label: "Contact", href: contact().url },
    ];

    const mockSearchResults = [
        { id: 1, name: "Plateau d'oeufs frais (30)", category: "Oeufs", price: "2 500 FCFA", image: "https://placehold.co/100?text=Oeufs", status: "En stock" },
        { id: 2, name: "Poule Pondeuse Lohmann", category: "Volailles", price: "4 000 FCFA", image: "https://placehold.co/100?text=Poule", status: "En stock" },
        { id: 3, name: "Aliment Démarrage 50kg", category: "Alimentation", price: "18 500 FCFA", image: "https://placehold.co/100?text=Aliment", status: "Promo" },
        { id: 4, name: "Huile de Palme (5L)", category: "Produits transformés", price: "4 500 FCFA", image: "https://placehold.co/100?text=Huile", status: "En stock" },
        { id: 5, name: "Alvéoles vides (Paquet)", category: "Matériel", price: "1 500 FCFA", image: "https://placehold.co/100?text=Alveoles", status: "Rupture" },
    ];

    const cartItems = [
        {
            id: 1,
            name: "Poule Pondeuse",
            price: 4000,
            quantity: 2,
            image: "https://placehold.co/100?text=Poule",
            variant: "Lohmann Brown" // VARIANTE EXISTANTE
        },
        {
            id: 2,
            name: "Aliment Démarrage",
            price: 18500,
            quantity: 1,
            image: "https://placehold.co/100?text=Sac",
            variant: "Sac de 50kg" // VARIANTE EXISTANTE
        },
        {
            id: 3,
            name: "Plateau d'oeufs",
            price: 2500,
            quantity: 3,
            image: "https://placehold.co/100?text=Oeufs",
            variant: null // PAS DE VARIANTE
        },
    ];

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

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
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="relative border-stone-200 hover:border-primary text-stone-700 hover:bg-primary/10 hover:text-primary mr-1">
                                <ShoppingBasket className="h-5 w-5" />
                                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground p-0 text-[10px]">
                                    {cartItems.length}
                                </Badge>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col p-0">
                            <SheetHeader className="px-4 py-4 border-b flex flex-row items-center justify-between space-y-0">
                                <SheetTitle className="text-lg font-semibold">Mon Panier ({cartItems.length})</SheetTitle>
                                {/* Le bouton de fermeture est géré automatiquement par SheetContent, mais on peut le styliser si besoin */}
                            </SheetHeader>

                            {/* LISTE DES PRODUITS */}
                            <ScrollArea className="flex-1 px-4">
                                <div className="flex flex-col gap-6 py-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            {/* Image */}
                                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-50">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            {/* Détails */}
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="grid gap-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium text-stone-900 leading-none">
                                                            {item.name}
                                                        </h3>
                                                        <p className="font-bold text-stone-900">
                                                            {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                                                        </p>
                                                    </div>

                                                    {/* Affichage conditionnel de la VARIANTE */}
                                                    {item.variant ? (
                                                        <p className="text-sm text-stone-500">
                                                            Variante: <span className="font-medium text-stone-700">{item.variant}</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-stone-400 italic">Standard</p>
                                                    )}
                                                </div>

                                                {/* Contrôles Quantité & Suppression */}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center border border-stone-200 rounded-md h-8">
                                                        <button className="px-2 hover:bg-stone-100 h-full text-stone-600 disabled:opacity-50">
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="px-2 text-xs font-medium min-w-[1.5rem] text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button className="px-2 hover:bg-stone-100 h-full text-stone-600">
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <button className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium hover:underline">
                                                        <Trash2 className="h-3 w-3" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* FOOTER PANIER */}
                            <div className="border-t bg-stone-50 p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-base font-medium text-stone-900">
                                        <span>Sous-total</span>
                                        <span>{cartTotal.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        Frais de livraison calculés à l'étape suivante.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Button className="w-full h-11 text-base font-semibold shadow-md">
                                        Commander maintenant
                                    </Button>
                                    <SheetClose asChild>
                                        <Button variant="outline" className="w-full h-11 border-stone-200">
                                            Continuer mes achats
                                        </Button>
                                    </SheetClose>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* --- PROFIL (POPOVER DESKTOP) --- */}
                    <div className="hidden lg:flex items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        {/* Image de l'avatar (remplacez src par l'URL de l'utilisateur si connecté) */}
                                        <AvatarImage src={auth?.user?.avatar_url || ''} alt="@user" />

                                        {/* Fallback : s'affiche si l'image ne charge pas ou si pas d'image */}
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            M
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-64 p-2">
                                <div className="px-2 py-1.5">
                                    <h4 className="text-sm font-semibold leading-none text-stone-900">Mon Compte</h4>
                                    <p className="text-xs text-stone-500 mt-1">Connectez-vous pour gérer vos commandes.</p>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid gap-2">
                                    {auth?.user ? (
                                        <>
                                            <Button asChild variant="ghost" className="w-full">
                                                <Link href={profile.index()} className="w-full justify-start gap-2 h-9 px-2 font-normal">
                                                    <UserCircle className="h-4 w-4 text-stone-500" />
                                                    Mon profil
                                                </Link>
                                            </Button>
                                            <Can role="superadmin">
                                                <Button asChild variant="ghost" className="w-full">
                                                    <Link href={dashboard()} className="w-full justify-start gap-2 h-9 px-2 font-normal">
                                                        <SquareActivity className="h-4 w-4 text-stone-500" />
                                                        Administration
                                                    </Link>
                                                </Button>
                                            </Can>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={logout()} onClick={handleLogout} className="w-full justify-start gap-2 h-9 px-2 font-normal">
                                                    <LogOut className="h-4 w-4" />
                                                    Déconnexion
                                                </Link>
                                            </Button>
                                        </>
                                    ) :
                                        <>
                                            <Button asChild variant="ghost" className="w-full">
                                                <Link href={login()} className="w-full justify-start gap-2 h-9 px-2 font-normal">
                                                    <LogIn className="h-4 w-4 text-stone-500" />
                                                    Se connecter
                                                </Link>
                                            </Button>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={register()} className="w-full justify-start gap-2 h-9 px-2 font-normal">
                                                    <UserPlus className="h-4 w-4" />
                                                    Créer un compte
                                                </Link>
                                            </Button>
                                        </>}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* --- MENU MOBILE (SHEET) --- */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden -mr-2">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col h-full p-0 gap-0">
                            {/* Header du Sheet */}
                            <SheetHeader className="p-4 border-b text-left">
                                <SheetTitle className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                        <Tractor className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="font-bold">{name}</span>
                                </SheetTitle>
                            </SheetHeader>

                            {/* Navigation Scrollable */}
                            <ScrollArea className="flex-1">
                                <nav className="flex flex-col gap-1 p-4">
                                    {navItems.map((item) => (
                                        <Link key={item.label} href={item.href} className="flex items-center justify-between py-3 px-3 text-base font-medium text-stone-600 transition-colors hover:text-primary hover:bg-stone-50 rounded-lg">
                                            {item.label}
                                            <ChevronRight className="h-4 w-4 text-stone-300" />
                                        </Link>
                                    ))}
                                </nav>
                            </ScrollArea>

                            {/* Section Auth "Footer" Professionnelle */}
                            <div className="mt-auto border-t bg-stone-50 p-6">
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-stone-900">Espace Client</h4>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        Accédez à vos commandes et favoris.
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    {auth?.user ?
                                        <>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href={profile.index()} className="w-full justify-start gap-3 h-10 rounded-lg text-base font-medium">
                                                    <UserCircle className="h-5 w-5 opacity-70" />
                                                    Mon profil
                                                </Link>
                                            </Button>
                                            <Can role="superadmin">
                                                <Button asChild variant="outline" className="w-full">
                                                    <Link href={dashboard()} className="w-full justify-start gap-3 h-10 rounded-lg text-base font-medium">
                                                        <SquareActivity className="h-5 w-5 opacity-70" />
                                                        Administration
                                                    </Link>
                                                </Button>
                                            </Can>
                                            <Button asChild variant="destructive" className="w-full">
                                                <Link href={logout()} onClick={handleLogout} className="w-full justify-start gap-3 h-10 rounded-lg text-base font-medium">
                                                    <LogOut className="h-4 w-4" />
                                                    Déconnexion
                                                </Link>
                                            </Button>
                                        </>
                                        :
                                        <>
                                            {/* Bouton de Connexion : Primaire, Sombre, Fort */}
                                            <Button asChild className="w-full">
                                                <Link href={login()} className="w-full justify-start gap-3 h-10 rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-all">
                                                    <LogIn className="h-5 w-5 opacity-70" />
                                                    Se connecter
                                                </Link>
                                            </Button>

                                            {/* Bouton d'Inscription : Secondaire, Blanc, Épuré */}
                                            <Button asChild variant="outline" className="w-full">
                                                <Link
                                                    href={register()}
                                                    className="w-full justify-start gap-3 h-10 rounded-lg text-base font-medium bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 shadow-sm"
                                                >
                                                    <UserPlus className="h-5 w-5 text-primary opacity-80" />
                                                    Créer un compte
                                                </Link>
                                            </Button>
                                        </>}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};
