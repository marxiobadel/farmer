import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    CheckCircle2,
    Star,
    ShieldCheck,
    Truck,
    Sparkles,
    Wheat,
    TrendingUp,
    Clock
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { router, usePage } from "@inertiajs/react";
import pro from "@/routes/pro";
import products from "@/routes/products";
import { NumberTicker } from "../ui/number-ticker";
import { SharedData } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { register } from "@/routes";
import { BackgroundGlow, Farm3DVisual } from "./hero-visuals";

const africanAvatars = [
    {
        name: "Samuel - Gérant d'Hôtel",
        url: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
        name: "Aïcha - Traiteur & Restauratrice",
        url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
        name: "Nathalie - Chef Pâtissière",
        url: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=120&h=120&q=80",
    },
    {
        name: "Koffi - Maître Rôtisseur",
        url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&h=120&q=80",
    },
];

export const HeroSection = () => {
    const { auth } = usePage<SharedData>().props;
    const isMobile = useIsMobile();

    // Framer Motion 3D Tilt calculation
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 22, stiffness: 140 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isMobile) return;
        const rect = cardRef.current.getBoundingClientRect();
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
        <section className="relative w-full overflow-hidden bg-background pt-16 pb-16 sm:pt-24 sm:pb-24">
            {/* Background radial glow */}
            <BackgroundGlow />

            <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">

                    {/* Left Column: Copy & CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8 lg:col-span-7"
                    >
                        {/* Live Indicator Pill */}
                        <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs sm:text-sm font-semibold text-foreground shadow-sm backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            {!isMobile && (
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    Production du jour :
                                </span>
                            )}
                            <span className="font-bold text-primary">En stock & expédié sous 24h</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-[4.2rem] leading-[1.08]">
                            L'Excellence <br />
                            <span className="relative inline-block bg-gradient-to-r from-primary via-primary/85 to-amber-600 bg-clip-text text-transparent">
                                Avicole Locale
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="max-w-xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
                            Des poules élevées en plein air avec une alimentation 100% naturelle et sans OGM.
                            Qualité certifiée, fraîcheur garantie et traçabilité transparente pour les professionnels et les particuliers.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                            {!auth?.user && isMobile ? (
                                <Button
                                    onClick={() => router.visit(register())}
                                    size="lg"
                                    className="group h-13 rounded-full bg-primary text-primary-foreground px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:opacity-95 hover:scale-[1.02] active:scale-95"
                                >
                                    Inscription
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => router.visit(products.index().url)}
                                    size="lg"
                                    className="group h-13 rounded-full bg-primary text-primary-foreground px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:opacity-95 hover:scale-[1.02] active:scale-95"
                                >
                                    Voir nos produits
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            )}

                            <Button
                                onClick={() => router.visit(pro.index().url)}
                                size="lg"
                                variant="outline"
                                className="h-13 rounded-full border-border bg-card/60 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary hover:text-primary hover:bg-accent/40 active:scale-95"
                            >
                                Devenir Partenaire
                            </Button>
                        </div>

                        {/* Trust Points */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
                            {[
                                { icon: Truck, title: "Livraison 24h", desc: "Chaîne du froid respectée" },
                                { icon: ShieldCheck, title: "Contrôle vétérinaire", desc: "Suivi sanitaire continu" },
                                { icon: Wheat, title: "100% Naturel", desc: "Alimentation certifiée" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 + i * 0.08 }}
                                    className="flex items-center gap-3 rounded-xl bg-card/60 p-2.5 border border-border/70 backdrop-blur-xs"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <item.icon className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Social Proof Ratings */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 pt-2">
                            {/* Avatar Stack with African portraits + Counter Chip */}
                            <div className="flex -space-x-2.5 overflow-hidden p-0.5">
                                {africanAvatars.map((person, idx) => (
                                    <img
                                        key={idx}
                                        src={person.url}
                                        alt={person.name}
                                        title={person.name}
                                        className="inline-block h-9 w-9 rounded-full ring-2 ring-background object-cover shadow-xs transition-transform duration-200 hover:scale-110 hover:z-10"
                                    />
                                ))}
                                {/* +450 Badge Pill */}
                                <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-primary/10 px-2 text-[11px] font-black text-primary ring-2 ring-background backdrop-blur-xs">
                                    +450
                                </div>
                            </div>

                            {/* Ratings & Local Trust Label */}
                            <div className="space-y-0.5 text-left">
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center text-amber-500">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-black text-foreground">4.9 / 5</span>
                                    <span className="text-muted-foreground/40 text-xs">•</span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                        <ShieldCheck className="h-3 w-3" />
                                        Vérifié
                                    </span>
                                </div>

                                <p className="text-xs font-medium text-muted-foreground leading-tight">
                                    Recommandé par <span className="font-semibold text-foreground">+450 restaurants, hôtels & ménages</span>
                                </p>
                            </div>
                        </div>

                    </motion.div>

                    {/* Right Column: 3D Interactive Card */}
                    <div
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="perspective-1000 lg:col-span-5 relative flex items-center justify-center"
                    >
                        <motion.div
                            style={{
                                rotateX: isMobile ? 0 : rotateX,
                                rotateY: isMobile ? 0 : rotateY,
                                transformStyle: "preserve-3d",
                            }}
                            className="relative w-full max-w-[480px] transition-transform duration-150 ease-out"
                        >
                            <Farm3DVisual />

                            {/* Floating Badge 1: Production Counter */}
                            <motion.div
                                animate={{ y: [0, -7, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                style={{ transform: "translateZ(45px)" }}
                                className="absolute -top-5 -left-5 z-30 rounded-2xl border border-border bg-card/90 p-4 shadow-md backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-foreground">
                                                <NumberTicker value={50} />k+
                                            </span>
                                            <span className="text-xs font-semibold text-emerald-500">+18%</span>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground">Œufs / semaine</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Badge 2: Sanitary Certificate */}
                            <motion.div
                                animate={{ y: [0, 7, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                                style={{ transform: "translateZ(55px)" }}
                                className="absolute -bottom-5 -right-3 z-30 rounded-2xl border border-border bg-card/90 p-4 shadow-md backdrop-blur-sm max-w-[200px]"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-foreground">Norme ISO 22000</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                    Traçabilité intégrale gravée avec date de ponte.
                                </p>
                            </motion.div>

                            {/* Floating Badge 3: Caliber */}
                            <motion.div
                                animate={{ scale: [1, 1.04, 1] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                                style={{ transform: "translateZ(30px)" }}
                                className="absolute top-1/2 -right-6 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-primary/20 bg-card/85 px-3 py-2 shadow-md backdrop-blur-md"
                            >
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold text-foreground">Calibre L & XL</span>
                            </motion.div>

                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};
