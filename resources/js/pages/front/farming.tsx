import AppLayout from "@/layouts/app-layout";
import { contact } from "@/routes";
import { Head, Link } from "@inertiajs/react";
import { motion, Variants } from "framer-motion";
import { Leaf, Thermometer, Activity, Scale } from "lucide-react";

// Animations
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function Farming() {
    return (
        <AppLayout layout="guest">
            <Head title="Notre Élevage" />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-stone-900 h-[60vh] min-h-[500px] flex items-center overflow-hidden">
                {/* Image de fond */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 to-stone-900/30 z-10" />
                    <img
                        src="/images/farm-hero.jpg"
                        alt="Vue panoramique de l'élevage"
                        className="w-full h-full object-cover opacity-80"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-3xl"
                    >
                        <motion.div variants={fadeInUp}>
                            <span className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                                Savoir-faire & Tradition
                            </span>
                        </motion.div>
                        <motion.h1 variants={fadeInUp} className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-7xl font-serif">
                            Au cœur de <br/><span className="text-primary">notre élevage</span>
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="mt-6 text-xl text-stone-200 max-w-2xl">
                            Découvrez comment nous allions respect du bien-être animal et standards sanitaires rigoureux pour produire les meilleurs œufs du Cameroun.
                        </motion.p>
                    </motion.div>
                </div>
            </div>

            {/* --- SECTION: POULES PONDEUSES --- */}
            <section className="py-20 sm:py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Image Composition */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] w-full rounded-2xl bg-stone-100 overflow-hidden shadow-xl sm:shadow-2xl relative">
                                <img
                                    src="/images/layers.jpg"
                                    alt="Poules pondeuses en plein air"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                />
                            </div>

                            {/* Petite image flottante */}
                            <div className="absolute -bottom-10 -right-10 w-2/3 aspect-video rounded-xl bg-stone-100 shadow-xl border-4 border-white overflow-hidden hidden md:block">
                                <img
                                    src="/images/eggs-basket.jpg"
                                    alt="Panier d'œufs frais"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </motion.div>

                        {/* Contenu Texte */}
                        <div className="lg:pl-10 mt-6 lg:mt-0">
                            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl font-serif mb-6">
                                Nos Poules Pondeuses
                            </h2>
                            <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                                Nos pondeuses bénéficient d'une alimentation 100% végétale et équilibrée, élaborée par des nutritionnistes vétérinaires. Elles évoluent dans des bâtiments modernes, ventilés et lumineux, garantissant un confort optimal.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 p-4 rounded-xl bg-stone-50 border border-stone-100">
                                    <div className="flex-none w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Leaf className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900">Alimentation Contrôlée</h3>
                                        <p className="text-sm text-stone-500">Maïs, soja, vitamines et minéraux. Sans farines animales.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 rounded-xl bg-stone-50 border border-stone-100">
                                    <div className="flex-none w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900">Suivi Vétérinaire</h3>
                                        <p className="text-sm text-stone-500">Contrôles hebdomadaires et prophylaxie rigoureuse.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 rounded-xl bg-stone-50 border border-stone-100">
                                    <div className="flex-none w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Thermometer className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900">Ambiance Maîtrisée</h3>
                                        <p className="text-sm text-stone-500">Température et hygrométrie régulées automatiquement.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION: PROCESSUS QUALITÉ (Sombre) --- */}
            <section className="py-20 sm:py-24 bg-stone-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-serif mb-4">
                            De la ponte à votre assiette
                        </h2>
                        <p className="text-stone-400 text-lg">
                            Un processus rigoureux en 4 étapes pour garantir une fraîcheur absolue.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Ramassage", desc: "Collecte manuelle ou automatisée 2 fois par jour pour éviter les chocs." },
                            { step: "02", title: "Tri & Calibrage", desc: "Inspection visuelle et pesée électronique de chaque œuf." },
                            { step: "03", title: "Conditionnement", desc: "Mise en alvéoles neuves et datage immédiat." },
                            { step: "04", title: "Expédition", desc: "Départ des camions moins de 24h après la ponte." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-stone-800/50 p-8 rounded-2xl border border-stone-700 hover:bg-stone-800 transition-colors relative group">
                                <span className="text-6xl font-bold text-stone-800 absolute top-4 right-4 group-hover:text-stone-700 transition-colors select-none">
                                    {item.step}
                                </span>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                                    <p className="text-stone-400 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- GALERIE PHOTO --- */}
            <section className="py-20 sm:py-24 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl font-serif mb-12 text-center">
                        La vie à la ferme en images
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Grande image gauche */}
                        <div className="md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden bg-stone-200 relative group cursor-pointer">
                            <img
                                src="/images/infrastructure.jpg"
                                alt="Vue d'ensemble des bâtiments"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <p className="text-white font-medium text-lg">Infrastructures Modernes</p>
                            </div>
                        </div>

                        {/* Image haut droite (Poussins) */}
                        <div className="rounded-2xl overflow-hidden bg-stone-200 relative group cursor-pointer">
                            <img
                                src="/images/chicks.jpg"
                                alt="Poussins"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <p className="text-white font-medium">La nurserie</p>
                            </div>
                        </div>

                        {/* Image bas droite (Panier) */}
                        <div className="rounded-2xl overflow-hidden bg-stone-200 relative group cursor-pointer">
                            <img
                                src="/images/eggs-basket.jpg"
                                alt="Panier d'œufs"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <p className="text-white font-medium">Récolte du jour</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA --- */}
            <section className="py-20 sm:py-24 bg-primary/5">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
                    <Scale className="w-12 h-12 text-primary mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-stone-900 mb-6 font-serif">
                        Des produits sains pour une alimentation saine
                    </h2>
                    <p className="text-lg text-stone-600 mb-8">
                        Vous êtes un professionnel ? Venez visiter nos installations sur rendez-vous pour constater par vous-même notre niveau d'exigence.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href={contact()} className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            Prendre rendez-vous
                        </Link>
                        <a href="/" className="bg-white text-stone-900 border border-stone-200 px-8 py-3 rounded-full font-semibold hover:bg-stone-50 transition-all">
                            Voir la boutique
                        </a>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
