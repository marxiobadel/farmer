import { ShieldCheck, Truck, Sprout, Award } from "lucide-react";

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

export const FeaturesSection = () => {
    return (
        <div className="bg-white py-16 sm:py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-bold leading-7 text-primary tracking-widest uppercase">
                        Pourquoi Montview ?
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
                        L'exigence avicole réinventée
                    </p>
                    <p className="mt-6 text-lg leading-8 text-stone-600">
                        Nous ne faisons aucun compromis sur la santé de nos bêtes ni sur la qualité de nos produits. Une différence que vous goûterez dès la première omelette.
                    </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-12 sm:gap-y-16 lg:max-w-none lg:grid-cols-4">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col items-start group">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 border border-stone-100 shadow-sm transition-colors group-hover:bg-primary/10 group-hover:border-primary/20">
                                    <feature.icon className="h-7 w-7 text-stone-600 transition-colors group-hover:text-primary" aria-hidden="true" />
                                </div>
                                <dt className="text-lg font-bold leading-7 text-stone-900">
                                    {feature.name}
                                </dt>
                                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-stone-500">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
};
