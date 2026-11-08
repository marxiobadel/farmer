import { Link, router, usePage } from "@inertiajs/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tractor, ChevronRight, UserCircle, LogOut, LogIn, UserPlus, SquareActivity } from "lucide-react";
import { useInitials } from "@/hooks/use-initials";
import type { SharedData } from "@/types";
import { navItems } from "./header";
import profile from "@/routes/profile";
import { dashboard, login, register } from "@/routes";
import Can from "../can";

interface MobileMenuProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MobileMenu = ({ isOpen, onOpenChange }: MobileMenuProps) => {
    const { name, auth } = usePage<SharedData>().props;
    const { url } = usePage();
    const getInitials = useInitials();

    const handleLogout = () => {
        onOpenChange(false);
        router.flushAll();
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex h-full w-[85%] sm:max-w-sm flex-col p-0 border-border bg-card">
                {/* Mobile Header */}
                <SheetHeader className="border-b border-border p-4 text-left">
                    <SheetTitle className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Tractor className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-foreground text-base">{name || "MontView"}</span>
                    </SheetTitle>
                </SheetHeader>

                {/* User Card if Authenticated */}
                {auth?.user && (
                    <div className="border-b border-border/80 bg-muted/30 p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {getInitials(auth.user.fullname)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground truncate">{auth.user.fullname}</p>
                            <p className="text-xs text-muted-foreground truncate">{auth.user.email}</p>
                        </div>
                    </div>
                )}

                {/* Scrollable Navigation */}
                <ScrollArea className="flex-1 p-3">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = item.href === "/" ? url === "/" : url.startsWith(item.href);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => onOpenChange(false)}
                                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                            ? "bg-primary/15 text-primary font-semibold"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}
                                >
                                    {item.label}
                                    <ChevronRight className="h-4 w-4 opacity-40" />
                                </Link>
                            );
                        })}
                    </nav>
                </ScrollArea>

                {/* Bottom Auth Actions */}
                <div className="border-t border-border bg-muted/20 p-4 space-y-2">
                    {auth?.user ? (
                        <>
                            <Button asChild variant="outline" className="w-full justify-start gap-2.5 text-xs font-semibold rounded-xl">
                                <Link href={profile.index()} onClick={() => onOpenChange(false)}>
                                    <UserCircle className="h-4 w-4" />
                                    Mon Profil
                                </Link>
                            </Button>
                            <Can role="superadmin">
                                <Button asChild variant="outline" className="w-full justify-start gap-2.5 text-xs font-semibold rounded-xl">
                                    <Link href={dashboard()} onClick={() => onOpenChange(false)}>
                                        <SquareActivity className="h-4 w-4" />
                                        Administration
                                    </Link>
                                </Button>
                            </Can>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="w-full justify-start gap-2.5 text-xs font-semibold rounded-xl"
                            >
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </Button>
                        </>
                    ) : (
                        <div className="grid gap-2">
                            <Button asChild className="w-full justify-center rounded-xl font-semibold shadow-xs">
                                <Link href={login()} onClick={() => onOpenChange(false)}>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Se connecter
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-center rounded-xl font-semibold">
                                <Link href={register()} onClick={() => onOpenChange(false)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Créer un compte
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
