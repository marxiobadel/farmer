import { Link, usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import {
    User,
    Package,
    LogOut,
    LayoutDashboard,
    MapPin,
    ShieldCheck,
    Sparkles
} from "lucide-react";
import { logout } from "@/routes";
import profile from "@/routes/profile";

interface MenuItem {
    title: string;
    href: string;
    icon: any;
    active: boolean;
    disabled?: boolean;
}

export default function ProfileSidebar({ className }: { className?: string }) {
    const { url } = usePage();

    // Helpers pour la détection de l'URL active
    const isActive = (path: string) => url.startsWith(path);
    const isExact = (path: string) => url === path;

    // Définition des liens avec les routes Ziggy (ou vos helpers de routes)
    const items: MenuItem[] = [
        {
            title: "Tableau de bord",
            href: profile.index().url,
            icon: LayoutDashboard,
            active: isExact('/profile'),
        },
        {
            title: "Mes commandes",
            href: profile.orders().url,
            icon: Package,
            active: isActive('/profile/orders'),
        },
        {
            title: "Espace Pro",
            href: profile.espacePro().url,
            icon: Sparkles,
            active: isActive('/profile/espace-pro'),
        },
        {
            title: "Mes données",
            href: profile.edit().url,
            icon: User,
            active: isActive('/profile/informations'),
        },
        {
            title: "Carnet d'adresses",
            href: profile.addresses().url,
            icon: MapPin,
            active: isActive('/profile/addresses'),
        },
        {
            title: "Sécurité & Connexion",
            href: profile.password.edit().url,
            icon: ShieldCheck,
            active: isActive('/profile/security'),
            disabled: false
        },
    ];

    return (
        <nav className={cn("flex flex-col space-y-1.5", className)}>
            {/* Titre de section optionnel pour plus de structure */}
            <div className="px-3 pb-2 pt-1">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Menu
                </p>
            </div>

            {items.map((item) => (
                <Link
                    key={item.title}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                        "group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out border border-transparent",
                        item.disabled && "opacity-50 pointer-events-none cursor-not-allowed",

                        // État Actif : Style "Carte flottante" blanche avec ombre douce
                        item.active
                            ? "bg-white text-primary font-medium shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border-stone-100"
                            : "text-stone-500 hover:text-stone-900 hover:bg-stone-100/70 hover:translate-x-1"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {/* Icône avec variation de couleur selon l'état */}
                        <item.icon
                            className={cn(
                                "h-4.5 w-4.5 transition-colors duration-200",
                                item.active ? "text-primary" : "text-stone-400 group-hover:text-stone-600"
                            )}
                        />
                        <span className="text-sm">{item.title}</span>
                    </div>

                    {/* Petite flèche indicatrice (visible seulement au survol ou actif) */}
                    {item.active && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mr-1 animate-in zoom-in duration-300" />
                    )}
                </Link>
            ))}

            <div className="pt-4 mt-2 px-3">
                <div className="h-px bg-stone-100 w-full mb-4" />

                <Link
                    href={logout()}
                    method="post"
                    as="button"
                    className={cn(
                        "group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600/80 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200"
                    )}
                >
                    <LogOut className="h-4.5 w-4.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    Déconnexion
                </Link>
            </div>
        </nav>
    );
}
