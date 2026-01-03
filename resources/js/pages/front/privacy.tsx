import AppLayout from "@/layouts/app-layout";
import { SharedData } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Shield, Lock, Eye, Server, FileText, Mail } from "lucide-react";

export default function Privacy() {
    const {name} = usePage<SharedData>().props;

    const lastUpdate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <AppLayout layout="guest">
            <Head title="Politique de Confidentialité" />

            <div className="bg-stone-50 min-h-screen py-16">
                <div className="max-w-4xl mx-auto px-4 lg:px-8">

                    {/* En-tête de document */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl mb-4 font-serif">
                            Politique de Confidentialité
                        </h1>
                        <p className="text-stone-500 text-lg">
                            Dernière mise à jour le <span className="font-medium text-stone-900">{lastUpdate}</span>
                        </p>
                    </div>

                    {/* Contenu principal (Style Document) */}
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                        <div className="p-4 sm:p-8 md:p-12 space-y-12">

                            {/* Introduction */}
                            <section>
                                <p className="text-stone-600 leading-relaxed text-lg">
                                    Chez <span className="font-semibold text-stone-900">{name}</span>, la confiance est au cœur de notre métier. Nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos données personnelles. Cette politique détaille de manière transparente comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.
                                </p>
                            </section>

                            <hr className="border-stone-100" />

                            {/* Section 1: Données collectées */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">1. Les données que nous collectons</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Nous collectons uniquement les données nécessaires au bon fonctionnement de nos services :
                                </p>
                                <ul className="grid sm:grid-cols-2 gap-4 mt-4">
                                    {[
                                        { title: "Identité", desc: "Nom, prénom, date de naissance (si nécessaire)." },
                                        { title: "Contact", desc: "Adresse email, numéro de téléphone, adresse de livraison." },
                                        { title: "Professionnel", desc: "Nom de l'entreprise, SIRET/NIU (pour les comptes Pro)." },
                                        { title: "Connexion", desc: "Adresse IP, type de navigateur, historique de navigation." },
                                        { title: "Transaction", desc: "Historique des commandes, détails des achats." },
                                    ].map((item, idx) => (
                                        <li key={idx} className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                                            <span className="block font-semibold text-stone-900 text-sm mb-1">{item.title}</span>
                                            <span className="text-stone-500 text-sm">{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-lg mt-4 border border-amber-100">
                                    <strong>Note importante :</strong> Nous ne stockons jamais vos informations bancaires complètes. Les paiements sont traités par nos partenaires sécurisés.
                                </div>
                            </section>

                            {/* Section 2: Utilisation */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Server className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">2. Utilisation de vos données</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Vos données sont traitées principalement pour :
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-primary">
                                    <li>Traiter et livrer vos commandes d'œufs et produits fermiers.</li>
                                    <li>Gérer votre compte client et notre relation commerciale.</li>
                                    <li>Vous envoyer des informations sur le suivi de commande.</li>
                                    <li>Améliorer notre site et personnaliser votre expérience.</li>
                                    <li>Prévenir la fraude et assurer la sécurité du site.</li>
                                </ul>
                            </section>

                            {/* Section 3: Partage */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Eye className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">3. Partage des données</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées uniquement avec :
                                </p>
                                <div className="space-y-3 mt-2">
                                    <p className="text-stone-600"><span className="font-semibold text-stone-800">Nos transporteurs :</span> Pour assurer la livraison à votre adresse.</p>
                                    <p className="text-stone-600"><span className="font-semibold text-stone-800">Prestataires de paiement :</span> Pour valider vos transactions.</p>
                                    <p className="text-stone-600"><span className="font-semibold text-stone-800">Autorités légales :</span> Si la loi nous y oblige.</p>
                                </div>
                            </section>

                            {/* Section 4: Sécurité */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">4. Sécurité des données</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées (chiffrement SSL, pare-feu, accès restreints) pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
                                </p>
                            </section>

                            {/* Section 5: Vos droits */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">5. Vos droits</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed mb-4">
                                    Conformément à la réglementation, vous disposez des droits suivants :
                                </p>
                                <div className="grid sm:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                                        <h3 className="font-bold text-stone-900 mb-2">Accès</h3>
                                        <p className="text-xs text-stone-500">Demander une copie de vos données.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                                        <h3 className="font-bold text-stone-900 mb-2">Rectification</h3>
                                        <p className="text-xs text-stone-500">Corriger des informations inexactes.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                                        <h3 className="font-bold text-stone-900 mb-2">Suppression</h3>
                                        <p className="text-xs text-stone-500">Demander l'effacement de vos données.</p>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-stone-100" />

                            {/* Contact */}
                            <section className="bg-stone-900 rounded-xl p-8 text-center sm:text-left sm:flex items-center justify-between gap-8">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">Une question sur vos données ?</h2>
                                    <p className="text-stone-400 text-sm">
                                        Notre délégué à la protection des données est à votre écoute.
                                    </p>
                                </div>
                                <a
                                    href="mailto:admin@montviewfarm.net"
                                    className="mt-6 sm:mt-0 inline-flex items-center justify-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-stone-100 transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    admin@montviewfarm.net
                                </a>
                            </section>

                        </div>
                    </div>

                    {/* Footer discret du document */}
                    <div className="mt-8 text-center text-xs text-stone-400">
                        © {new Date().getFullYear()} {name}. Tous droits réservés.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
