import { motion, type Variants } from "framer-motion";
import { ShieldCheck, Truck, Sprout, Award, CheckCircle2 } from "lucide-react";

interface FeatureItem {
    id: string;
    name: string;
    badge: string;
    metric: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const features: FeatureItem[] = [
    {
        id: "01",
        name: "Qualité Sanitaire Certifiée",
        badge: "Contrôle Vétérinaire",
        metric: "0% Antibiotique",
        description:
            "Suivi biologique continu et contrôle d'hygiène rigoureux. Nos poules grandissent en plein air dans un cadre sain, sans aucun traitement antibiotique préventif.",
        icon: ShieldCheck,
    },
    {
        id: "02",
        name: "Alimentation 100% Végétale",
        badge: "Filière Céréalière Locale",
        metric: "100% Naturel",
        description:
            "Formulation saine à base de maïs et soja locaux non OGM, enrichie en minéraux naturels pour des coquilles ultra-solides et des jaunes fermes et dorés.",
        icon: Sprout,
    },
    {
        id: "03",
        name: "Fraîcheur Récolte < 24h",
        badge: "Ramassage Matinal",
        metric: "Livraison 24h",
        description:
            "Œufs ramassés dès l'aube, triés, mirés et calibrés le jour même. Acheminement immédiat pour préserver toutes les qualités nutritionnelles et gustatives.",
        icon: Truck,
    },
    {
        id: "04",
        name: "Partenaire Grands Comptes",
        badge: "Hôtels, Restos & Épiceries",
        metric: "Capacité 50k+ / sem.",
        description:
            "Volumes sécurisés, facturation professionnelle normalisée, grilles tarifaires dégressives et tournées prioritaires pour les professionnels exigeants.",
        icon: Award,
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    },
};

export const FeaturesSection = () => {
    return (
        <section className="relative overflow-hidden bg-muted/30 py-20 sm:py-28">
            {/* Background radial atmosphere */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                        backgroundSize: "28px 28px",
                    }}
                />
                <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" />
                <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-accent blur-[110px]" />
            </div>

            <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-md"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Nos Engagements Qualité</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl"
                    >
                        L'exigence avicole{" "}
                        <span className="bg-gradient-to-r from-primary via-primary/85 to-amber-600 bg-clip-text text-transparent">
                            maîtrisée de A à Z
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground"
                    >
                        Du grain local sélectionné jusqu'à la livraison dans votre cuisine, nous éliminons les intermédiaires pour garantir une fraîcheur et une traçabilité sans compromis.
                    </motion.p>
                </div>

                {/* Features Responsive Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="mx-auto mt-14 sm:mt-18 lg:mt-20"
                >
                    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <motion.div
                                    key={feature.id}
                                    variants={itemVariants}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-7 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5"
                                >
                                    {/* Subtle step watermark */}
                                    <span className="pointer-events-none absolute right-4 top-3 text-4xl font-black tracking-tighter text-foreground/[0.04] select-none transition-colors group-hover:text-primary/[0.08]">
                                        {feature.id}
                                    </span>

                                    <div>
                                        {/* Top Row: Icon + Metric Pill */}
                                        <div className="flex items-center justify-between gap-2 mb-6">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/25">
                                                <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                                            </div>

                                            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground/80 ring-1 ring-inset ring-border transition-colors group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/25">
                                                {feature.metric}
                                            </span>
                                        </div>

                                        {/* Sub-badge */}
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                                            {feature.badge}
                                        </span>

                                        {/* Title */}
                                        <dt className="mt-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                                            {feature.name}
                                        </dt>

                                        {/* Description */}
                                        <dd className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                            <p>{feature.description}</p>
                                        </dd>
                                    </div>

                                    {/* Bottom animated border highlight */}
                                    <div className="mt-6 pt-4 border-t border-border/60">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span>Engagement vérifié</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </dl>
                </motion.div>
            </div>
        </section>
    );
};
