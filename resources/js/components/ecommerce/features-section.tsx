import { ShieldCheck, Truck, Sprout, Award } from "lucide-react";
import { motion, Variants } from "framer-motion";

const features = [
    {
        name: "Qualité Sanitaire Certifiée",
        description: "Suivi vétérinaire rigoureux. Nos poules grandissent dans un environnement sain, sans antibiotiques préventifs.",
        icon: ShieldCheck,
    },
    {
        name: "Alimentation 100% Naturelle",
        description: "Céréales locales sélectionnées (maïs, soja) garantissant des jaunes d'œufs riches et une coquille solide.",
        icon: Sprout,
    },
    {
        name: "Chaîne de Fraîcheur",
        description: "Œufs ramassés, calibrés et livrés sous 24h. Une fraîcheur absolue pour vos préparations culinaires.",
        icon: Truck,
    },
    {
        name: "Partenaire des Pros",
        description: "Capacité de volume, facturation pro et fiabilité logistique pour les hôtels et grossistes.",
        icon: Award,
    },
];

// Configuration des animations
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

export const FeaturesSection = () => {
    return (
        <section className="relative overflow-hidden bg-stone-50/50 py-20 sm:py-24">
            {/* Élément décoratif d'arrière-plan (optionnel) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-stone-200/40 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* En-tête de section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-inset ring-primary/20">
                        Pourquoi Montview ?
                    </span>
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
                        L'exigence avicole <span className="text-primary">réinventée</span>
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-stone-600">
                        Nous ne faisons aucun compromis sur la santé de nos bêtes ni sur la qualité de nos produits. Une différence que vous goûterez dès la première omelette.
                    </p>
                </motion.div>

                {/* Grille de fonctionnalités */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
                >
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-4 lg:gap-y-16">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.name}
                                variants={itemVariants}
                                className="group relative flex flex-col items-start rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/20"
                            >
                                {/* Icône */}
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-50 ring-1 ring-stone-100 transition-colors duration-300 group-hover:bg-primary group-hover:text-white group-hover:ring-primary">
                                    <feature.icon className="h-6 w-6 text-stone-500 transition-colors duration-300 group-hover:text-white" aria-hidden="true" />
                                </div>

                                {/* Contenu texte */}
                                <dt className="text-lg font-bold leading-7 text-stone-900 group-hover:text-primary transition-colors">
                                    {feature.name}
                                </dt>
                                <dd className="mt-2 flex flex-auto flex-col text-base leading-relaxed text-stone-500">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>

                                {/* Petit indicateur visuel (optionnel) */}
                                <div className="mt-4 h-1 w-12 rounded-full bg-stone-100 transition-all duration-300 group-hover:w-full group-hover:bg-primary/20" />
                            </motion.div>
                        ))}
                    </dl>
                </motion.div>
            </div>
        </section>
    );
};
