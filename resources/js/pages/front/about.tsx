import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { motion, Variants } from "framer-motion";
import { Award, Heart, Leaf, Users, CheckCircle, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contact } from "@/routes";

// Animation variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function About() {
    return (
        <AppLayout layout="guest">
            <Head title="À Propos" />

            {/* --- HERO SECTION ANIMÉE --- */}
            <div className="relative bg-stone-900 overflow-hidden isolate">
                {/* Fond décoratif (Gradient ou Image) */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 opacity-90" />
                    {/* Pattern subtil */}
                    <svg className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                        <defs>
                            <pattern id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" strokeWidth={0} fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 relative z-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                                    Depuis 2025
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-serif"
                            >
                                Nourrir l'Afrique avec <br/> <span className="text-primary">Excellence et Passion</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="mt-6 text-lg leading-8 text-stone-300"
                            >
                                Montview Farm est née d'une vision simple : offrir des produits fermiers sains, locaux et accessibles, tout en modernisant l'aviculture au Cameroun.
                            </motion.p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* --- NOTRE HISTOIRE --- */}
            <section className="py-20 sm:py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl mb-6">
                                Plus qu'une ferme, <br/> un écosystème.
                            </h2>
                            <div className="space-y-6 text-lg text-stone-600">
                                <p>
                                    Située au cœur de la région du Centre, Montview Farm a débuté avec un petit cheptel et une grande ambition. Aujourd'hui, nous sommes fiers de fournir des milliers de foyers et de professionnels en œufs frais et volailles de qualité supérieure.
                                </p>
                                <p>
                                    Nous croyons fermement que l'agriculture locale est la clé de l'autosuffisance alimentaire. C'est pourquoi nous investissons continuellement dans des infrastructures modernes respectueuses du bien-être animal.
                                </p>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                    <span className="font-medium text-stone-900">Traçabilité totale</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                    <span className="font-medium text-stone-900">Nourriture naturelle</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                    <span className="font-medium text-stone-900">Livraison 24h</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                    <span className="font-medium text-stone-900">Support Pro</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Image Placeholder (Remplacer par une vraie image) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="aspect-[4/3] rounded-2xl bg-stone-100 overflow-hidden shadow-xl border border-stone-200">
                                {/* Simuler une image */}
                                <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">
                                    <span className="flex flex-col items-center gap-2">
                                        <Sprout className="h-12 w-12" />
                                        <span>Photo de la ferme</span>
                                    </span>
                                </div>
                            </div>
                            {/* Élément décoratif flottant */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-stone-100 max-w-xs">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full text-primary">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-stone-500">Clients satisfaits</p>
                                        <p className="text-xl font-bold text-stone-900">+1 500</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- NOS VALEURS --- */}
            <section className="py-20 sm:py-24 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                            Nos Piliers Fondamentaux
                        </h2>
                        <p className="mt-4 text-lg text-stone-600">
                            Ce qui guide nos actions au quotidien dans la ferme.
                        </p>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: Leaf,
                                title: "Fraîcheur & Nature",
                                desc: "Nos produits quittent la ferme le matin pour arriver chez vous le jour même. Aucun conservateur, juste la nature."
                            },
                            {
                                icon: Heart,
                                title: "Bien-être Animal",
                                desc: "Des poules élevées en plein air ou dans des environnements contrôlés et sains, nourries avec des céréales de qualité."
                            },
                            {
                                icon: Award,
                                title: "Engagement Qualité",
                                desc: "Chaque œuf est calibré et inspecté. Nous ne faisons aucun compromis sur la qualité sanitaire de nos produits."
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-3">{item.title}</h3>
                                <p className="text-stone-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="py-16 bg-white border-t border-stone-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-stone-900 mb-6">Envie de goûter à la différence ?</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                                Voir nos produits
                            </Button>
                        </Link>
                        <Link href={contact()}>
                            <Button size="lg" variant="outline" className="rounded-full px-8 border-stone-300">
                                Nous contacter
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
