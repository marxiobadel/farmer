import { useCurrencyFormatter } from "@/hooks/use-currency";
import AppLayout from "@/layouts/app-layout";
import { SharedData } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Building2, Scale, Server, Copyright, Mail, Phone, MapPin } from "lucide-react";

export default function Legal() {
    const { name, settings } = usePage<SharedData>().props;

    const formatCurrency = useCurrencyFormatter();

    const lastUpdate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <AppLayout layout="guest">
            <Head title="Mentions Légales" />

            <div className="bg-stone-50 min-h-screen py-16">
                <div className="max-w-4xl mx-auto px-4 lg:px-8">

                    {/* En-tête de document */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl mb-4 font-serif">
                            Mentions Légales
                        </h1>
                        <p className="text-stone-500 text-lg">
                            En vigueur au <span className="font-medium text-stone-900">{lastUpdate}</span>
                        </p>
                    </div>

                    {/* Contenu principal */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                        <div className="p-4 sm:p-8 md:p-12 space-y-12">

                            {/* Introduction */}
                            <section>
                                <p className="text-stone-600 leading-relaxed text-lg">
                                    Conformément aux dispositions des articles de la loi portant sur la confiance dans l'économie numérique, il est porté à la connaissance des utilisateurs et visiteurs du site <span className="font-semibold text-stone-900">{name}</span> les présentes mentions légales.
                                </p>
                            </section>

                            <hr className="border-stone-100" />

                            {/* Section 1: Éditeur */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">1. Édition du site</h2>
                                </div>
                                <div className="bg-stone-50 rounded-xl p-6 border border-stone-100 space-y-4">
                                    <p className="text-stone-600">
                                        Le site <strong className="text-stone-900">{name}</strong> est édité par la société {name} SARL, au capital de {formatCurrency(Number(settings.budget))}.
                                    </p>
                                    <ul className="space-y-3 text-sm text-stone-600">
                                        {settings.headoffice && (
                                            <li className="flex items-start gap-3">
                                                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                <span>
                                                    <strong>Siège social :</strong><br />
                                                    {settings.headoffice}
                                                </span>
                                            </li>
                                        )}
                                        {settings.registration && (
                                        <li className="flex items-center gap-3">
                                            <Scale className="h-4 w-4 text-primary shrink-0" />
                                            <span><strong>Immatriculation (RC) :</strong> {settings.registration}</span>
                                        </li>)}
                                        {settings.taxpayer_number && (
                                        <li className="flex items-center gap-3">
                                            <span className="font-bold text-primary w-4 text-center">#</span>
                                            <span><strong>Numéro de contribuable (NIU) :</strong> {settings.taxpayer_number}</span>
                                        </li>)}
                                    </ul>
                                </div>
                            </section>

                            {/* Section 2: Hébergement */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Server className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">2. Hébergement</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Le site est hébergé par :
                                </p>
                                <div className="pl-4 border-l-2 border-stone-200 py-1 mt-2 text-stone-600">
                                    <p className="font-semibold text-stone-900">Nom de l'hébergeur : Namecheap</p>
                                    <p className="font-semibold text-stone-900">Adresse de l'hébergeur : </p>
                                    <p>Namecheap, Inc. 4600 East Washington Street Suite 300 Phoenix, AZ 85034 USA</p>
                                </div>
                            </section>

                            {/* Section 3: Propriété Intellectuelle */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Copyright className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">3. Propriété intellectuelle</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    L'ensemble de ce site relève de la législation camerounaise et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                                </p>
                                <p className="text-stone-600 leading-relaxed mt-2">
                                    La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                                </p>
                            </section>

                            {/* Section 4: Contact */}
                            <section className="bg-stone-900 rounded-xl p-8 text-center sm:text-left sm:flex items-center justify-between gap-8 mt-8">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-2">Nous contacter</h2>
                                    <p className="text-stone-400 text-sm">
                                        Pour tout signalement de contenu ou question légale.
                                    </p>
                                </div>
                                <div className="mt-6 sm:mt-0 flex flex-col gap-3">
                                    <a
                                        href="mailto:contact@montview.cm"
                                        className="inline-flex items-center justify-center gap-2 bg-white text-stone-900 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-stone-100 transition-colors"
                                    >
                                        <Mail className="h-4 w-4" />
                                        contact@montviewfarm.net
                                    </a>
                                    {settings?.phone && (
                                    <a
                                        href={`tel:${settings.phone}`}
                                        className="inline-flex items-center justify-center gap-2 bg-stone-800 text-stone-200 px-6 py-2.5 rounded-full font-medium text-sm hover:bg-stone-700 transition-colors"
                                    >
                                        <Phone className="h-4 w-4" />
                                        {settings.phone}
                                    </a>)}
                                </div>
                            </section>

                        </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-stone-400">
                        © {new Date().getFullYear()} {name}. Tous droits réservés.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
