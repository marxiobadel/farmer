import { useEffect, useState, useRef, type PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    ShieldCheck,
    Truck,
    Sparkles,
    CheckCircle2,
    Quote,
    Building2,
    Clock
} from 'lucide-react';
import { home } from '@/routes';
import logo from '@images/logo.png';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

const quotes = [
    { message: "La ferme est le cœur nourricier de notre terroir.", author: "Jean Dupont, Éleveur" },
    { message: "La fraîcheur d'un œuf ramassé le matin transforme n'importe quelle recette.", author: "Marie Leclerc, Chef Pâtissière" },
    { message: "Une traçabilité sanitaire sans compromis pour nos cuisines professionnelles.", author: "Paul Martin, Directeur F&B" },
    { message: "Le secret d'un élevage d'excellence : le respect animal et une alimentation 100% naturelle.", author: "Sophie Bernard, Vétérinaire conseil" },
    { message: "Un approvisionnement régulier et ponctuel, indispensable pour nos services du matin.", author: "Antoine Dubois, Restaurateur" },
];

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const [quoteIndex, setQuoteIndex] = useState(0);

    // Rotation automatique des citations avec fondu
    useEffect(() => {
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % quotes.length);
        }, 7000);
        return () => clearInterval(interval);
    }, []);

    // 3D Parallax Tilt pour le panneau de gauche
    const panelRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!panelRef.current) return;
        const rect = panelRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <div className="relative grid min-h-dvh flex-col items-center justify-center bg-background px-4 py-8 sm:px-6 lg:max-w-none lg:grid-cols-12 lg:px-0 lg:py-0">

            {/* --- Panneau Gauche : Showcase 3D, Réassurance & Citations (Desktop) --- */}
            <div
                ref={panelRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative hidden h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 p-10 xl:p-14 text-white lg:col-span-6 xl:col-span-7 lg:flex border-r border-border/40 select-none"
            >
                {/* Trame de fond subtile */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
                        backgroundSize: "28px 28px",
                    }}
                />

                {/* Halos lumineux d'ambiance */}
                <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
                <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-amber-600/15 blur-[140px]" />

                {/* Header Logo */}
                <div className="relative z-20 flex items-center justify-between">
                    <Link
                        href={home()}
                        className="group flex items-center gap-3 rounded-2xl bg-white/10 p-2.5 pr-4 backdrop-blur-md border border-white/15 transition-all hover:bg-white/15 hover:scale-[1.02]"
                    >
                        <div className="h-9 w-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                            <img src={logo} alt="MontView Logo" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-white text-sm tracking-tight leading-none">
                                MontView Farm
                            </span>
                            <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase">
                                Espace Privilège
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Plateforme Sécurisée SSL
                    </div>
                </div>

                {/* --- Élément 3D Central Interactif --- */}
                <div className="relative z-20 my-auto py-8 [perspective:1000px]">
                    <motion.div
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="relative mx-auto flex w-full max-w-[440px] flex-col items-center justify-center transition-transform duration-200 ease-out"
                    >
                        {/* Anneaux orbitaux gyro 3D */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                className="h-[320px] w-[320px] rounded-full border border-dashed border-amber-400/20"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                                className="h-[250px] w-[250px] rounded-full border border-primary/25"
                            />
                        </div>

                        {/* Carte Illustrée 3D */}
                        <div
                            style={{ transform: "translateZ(20px)" }}
                            className="relative flex aspect-square w-64 items-center justify-center rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
                        >
                            {/* Œuf 3D volumétrique en SVG */}
                            <svg viewBox="0 0 200 200" className="h-44 w-44 drop-shadow-[0_20px_35px_rgba(217,119,6,0.25)]" fill="none">
                                <defs>
                                    <radialGradient id="egg3DAuth" cx="35%" cy="30%" r="70%">
                                        <stop offset="0%" stopColor="#FFFBEB" />
                                        <stop offset="40%" stopColor="#FDE68A" />
                                        <stop offset="80%" stopColor="#D97706" />
                                        <stop offset="100%" stopColor="#78350F" />
                                    </radialGradient>
                                    <filter id="softGlowAuth">
                                        <feGaussianBlur stdDeviation="8" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <circle cx="100" cy="100" r="70" fill="#F59E0B" fillOpacity="0.12" filter="url(#softGlowAuth)" />

                                <motion.g
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <ellipse cx="100" cy="160" rx="36" ry="9" fill="#000000" fillOpacity="0.25" />
                                    <path
                                        d="M 100 40 C 135 40 148 105 148 135 C 148 160 126 172 100 172 C 74 172 52 160 52 135 C 52 105 65 40 100 40 Z"
                                        fill="url(#egg3DAuth)"
                                    />
                                    <ellipse cx="88" cy="80" rx="9" ry="20" transform="rotate(-20 88 80)" fill="#FFFFFF" fillOpacity="0.45" />
                                </motion.g>
                            </svg>
                        </div>

                        {/* Badge 3D Flottant 1 (Haut Gauche) */}
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transform: "translateZ(50px)" }}
                            className="absolute -top-4 -left-6 rounded-2xl border border-white/20 bg-stone-900/90 p-3 shadow-xl backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white leading-tight">Fraîcheur &lt; 24h</p>
                                    <p className="text-[10px] text-stone-400">Ponte locale certifiée</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Badge 3D Flottant 2 (Bas Droite) */}
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                            style={{ transform: "translateZ(65px)" }}
                            className="absolute -bottom-4 -right-6 rounded-2xl border border-white/20 bg-stone-900/90 p-3 shadow-xl backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white leading-tight">Suivi Vétérinaire</p>
                                    <p className="text-[10px] text-stone-400">Zéro antibiotique préventif</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Avantages du compte client */}
                    <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3 pt-4">
                        {[
                            { icon: Truck, title: "Livraison 24h", desc: "Chaîne du froid" },
                            { icon: Building2, title: "Tarifs Dégressifs", desc: "Comptes Pros & Gros" },
                            { icon: Clock, title: "Historique & Factures", desc: "Accès immédiat" },
                        ].map((perk, i) => (
                            <div key={i} className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-xs">
                                <perk.icon className="h-4 w-4 text-amber-400 mb-1" />
                                <span className="text-[11px] font-bold text-white leading-tight">{perk.title}</span>
                                <span className="text-[9px] text-stone-400 leading-tight mt-0.5">{perk.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Citations animé */}
                <div className="relative z-20 border-t border-white/10 pt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={quoteIndex}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.4 }}
                            className="flex items-start gap-3"
                        >
                            <Quote className="h-6 w-6 text-primary shrink-0 opacity-60 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium italic text-stone-200 leading-relaxed">
                                    "{quotes[quoteIndex].message}"
                                </p>
                                <p className="text-xs font-bold text-amber-300">
                                    {quotes[quoteIndex].author}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* --- Panneau Droit : Formulaire --- */}
            <div className="flex w-full items-center justify-center p-0 sm:p-4 md:p-8 lg:col-span-6 xl:col-span-5">
                <div className="w-full max-w-[420px] rounded-3xl border border-border/80 bg-card px-4 py-5 sm:p-6 md:p-8 shadow-sm shadow-black/5 backdrop-blur-xl">

                    {/* Logo Mobile uniquement */}
                    <div className="mb-6 flex justify-center lg:hidden">
                        <Link
                            href={home()}
                            className="flex items-center gap-2.5 rounded-2xl bg-muted/50 p-2 pr-4 border border-border transition-transform active:scale-95"
                        >
                            <div className="h-8 w-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
                                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                            </div>
                            <span className="font-extrabold text-foreground text-sm tracking-tight">
                                MontView Farm
                            </span>
                        </Link>
                    </div>

                    {/* En-tête du Formulaire */}
                    <div className="mb-6 space-y-1.5 text-center sm:text-left">
                        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                            {title}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Injection du formulaire (Login/Register/Reset) */}
                    {children}

                    {/* Reassurance Footer */}
                    <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Données cryptées
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Service client 7j/7
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}
