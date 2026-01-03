import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { BlobBackground, HenIllustration } from "./illustrations";
import { router } from "@inertiajs/react";
import pro from "@/routes/pro";

export const HeroSection = () => {
    return (
        <section className="relative w-full overflow-hidden bg-stone-50 pt-16 pb-20 sm:pt-20 sm:pb-24">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -z-10 opacity-30">
                <BlobBackground className="w-[800px] h-[800px] text-primary/20 blur-3xl rotate-45 translate-x-1/3 -translate-y-1/3" />
            </div>
            <div className="absolute bottom-0 left-0 -z-10 opacity-30">
                <BlobBackground className="w-[600px] h-[600px] text-amber-200/40 blur-3xl -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary border border-primary/20 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                            </span>
                            Production fraîche du jour
                        </div>

                        <h1 className="text-5xl font-extrabold tracking-tight text-stone-900 sm:text-6xl lg:text-7xl leading-[1.1]">
                            L'Excellence <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600">
                                Avicole Locale
                            </span>
                        </h1>

                        <p className="text-xl text-stone-600 max-w-xl leading-relaxed">
                            Nous élevons des poules heureuses pour des œufs d'exception.
                            Qualité sanitaire certifiée, alimentation 100% naturelle et traçabilité complète pour les professionnels et les familles.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-105">
                                Voir nos offres
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => router.visit(pro.index().url)}
                                size="lg"
                                variant="outline"
                                className="border-2 border-stone-200 text-stone-700 hover:border-primary hover:text-primary hover:bg-transparent h-14 px-8 text-lg rounded-full">
                                Devenir Partenaire
                            </Button>
                        </div>

                        <div className="pt-6 flex flex-col sm:flex-row gap-6 text-sm font-medium text-stone-500">
                            {['Livraison express 24h', 'Suivi vétérinaire', 'Prix producteur'].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="rounded-full bg-primary/10 p-1">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
                    >
                        <div className="relative aspect-square">
                            {/* Main Illustration */}
                            <div className="absolute inset-0 z-10">
                                <HenIllustration />
                            </div>

                            {/* Floating Stats Cards */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="absolute top-10 right-0 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-stone-100 max-w-[180px]"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                        <Star className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="font-bold text-stone-900">Premium</span>
                                </div>
                                <p className="text-xs text-stone-500">Calibre L & XL uniquement</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                                className="absolute bottom-10 left-0 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-stone-100"
                            >
                                <p className="text-3xl font-bold text-primary">50k+</p>
                                <p className="text-sm font-medium text-stone-600">Œufs / mois</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
