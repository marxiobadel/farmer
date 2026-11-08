import { Link, router, usePage } from "@inertiajs/react";
import { UserCircle, SquareActivity, LogOut, LogIn, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useInitials } from "@/hooks/use-initials";
import type { SharedData } from "@/types";
import profile from "@/routes/profile";
import Can from "../can";
import { dashboard, login, logout, register } from "@/routes";

export const UserProfileMenu = () => {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const handleLogout = () => {
        router.flushAll();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={auth?.user?.avatar_url || ""} alt="@user" className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {auth?.user ? getInitials(auth.user.fullname) : "M"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-60 p-2 border-border bg-card shadow-xl rounded-2xl">
                <div className="px-2.5 py-2">
                    <p className="text-xs font-bold text-foreground">
                        {auth?.user ? auth.user.fullname : "Mon Compte"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                        {auth?.user ? auth.user.email : "Connectez-vous pour vos commandes"}
                    </p>
                </div>
                <Separator className="my-1.5" />

                <div className="flex flex-col gap-1">
                    {auth?.user ? (
                        <>
                            <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-xs font-normal">
                                <Link href={profile.index()}>
                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                    Mon Profil
                                </Link>
                            </Button>
                            <Can role="superadmin">
                                <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-xs font-normal">
                                    <Link href={dashboard()}>
                                        <SquareActivity className="h-4 w-4 text-muted-foreground" />
                                        Administration
                                    </Link>
                                </Button>
                            </Can>
                            <Separator className="my-1" />
                            <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-xs font-normal text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Link href={logout()} onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" />
                                    Déconnexion
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild variant="default" size="sm" className="w-full justify-start gap-2.5 text-xs font-semibold rounded-lg">
                                <Link href={login()}>
                                    <LogIn className="h-4 w-4" />
                                    Se connecter
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2.5 text-xs font-medium rounded-lg">
                                <Link href={register()}>
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    Créer un compte
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
