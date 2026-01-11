import { UserCircle, SquareActivity, LogOut, LogIn, UserPlus, Menu, Tractor, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Link, router, usePage } from "@inertiajs/react";
import profile from "@/routes/profile";
import Can from "../can";
import { about, contact, dashboard, farming, login, logout, register } from "@/routes";
import { SharedData } from "@/types";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import products from "@/routes/products";
import { useInitials } from "@/hooks/use-initials";

export const navItems = [
    { label: "Nos Produits", href: products.index().url },
    { label: "Elevage", href: farming().url },
    { label: "À propos", href: about().url },
    { label: "Contact", href: contact().url },
];

export const MenuProfile = () => {
    const { name, auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            {/* --- PROFIL (POPOVER DESKTOP) --- */}
            <div className="hidden lg:flex items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                {/* Image de l'avatar (remplacez src par l'URL de l'utilisateur si connecté) */}
                                <AvatarImage className="object-cover" src={auth.user ? auth.user.avatar_url : ''} alt="@user" />

                                {/* Fallback : s'affiche si l'image ne charge pas ou si pas d'image */}
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {auth.user ? getInitials(auth.user.fullname) : "M"}
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
                            {auth.user ? (
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
                            {auth.user ?
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
        </>
    );
};
