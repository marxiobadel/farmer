import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { SharedData } from "@/types";
import ProfileSidebar from "@/components/ecommerce/profile-sidebar";
import { contact } from "@/routes";
import products from "@/routes/products";
import { PropsWithChildren } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function ProfileLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="bg-stone-50/50 min-h-screen py-10 lg:py-16 font-sans">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* En-tête de page moderne avec Avatar intégré */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-200/60">
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-foreground p-1 shadow-lg shadow-primary/20">
                            <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-primary">
                                {auth.user.firstname.charAt(0)}{auth.user.lastname.charAt(0)}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                                Bonjour, {auth.user.firstname}
                            </h1>
                            <p className="mt-1 text-base text-stone-500">
                                Ravi de vous revoir. Voici ce qu'il se passe sur votre compte.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline" className="rounded-full border-stone-200">
                            <Link href={contact()}>Support client</Link>
                        </Button>
                        <Button asChild className="rounded-full shadow-md shadow-primary/20">
                            <Link href={products.index()}>Nouvelle commande</Link>
                        </Button>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    {/* Sidebar Navigation */}
                    {/* --- VERSION MOBILE : SHADCN SHEET --- */}
                    <div className="lg:hidden mb-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full justify-start gap-2 bg-white/50 backdrop-blur-xl border-stone-200/60">
                                    <Menu className="h-4 w-4" />
                                    Menu du profil
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                                <div className="px-4 py-4">
                                    <h3 className="mb-4 text-lg font-semibold tracking-tight text-stone-900">
                                        Mon Compte
                                    </h3>
                                    {/* On réutilise le composant Sidebar ici */}
                                    <ProfileSidebar />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* --- VERSION DESKTOP : STICKY SIDEBAR --- */}
                    <aside className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-8">
                            <ProfileSidebar className="bg-white/50 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-4" />
                        </div>
                    </aside>

                    {/* Contenu Principal */}
                    <div className="lg:col-span-9 space-y-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
