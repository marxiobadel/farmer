import AppLayout from "@/layouts/app-layout";
import { SharedData } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { ShoppingCart, Truck, CreditCard, RefreshCcw, FileCheck, Scale, AlertCircle } from "lucide-react";

export default function CGV() {
    const {name} = usePage<SharedData>().props;

    const lastUpdate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <AppLayout layout="guest">
            <Head title="Conditions Générales de Vente - Montview Farm" />

            <div className="bg-stone-50 min-h-screen py-16">
                <div className="max-w-4xl mx-auto px-4 lg:px-8">

                    {/* En-tête de document */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl mb-4 font-serif">
                            Conditions Générales de Vente
                        </h1>
                        <p className="text-stone-500 text-lg">
                            Dernière mise à jour le <span className="font-medium text-stone-900">{lastUpdate}</span>
                        </p>
                    </div>

                    {/* Contenu principal */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                        <div className="p-4 sm:p-8 md:p-12 space-y-12">

                            {/* Préambule */}
                            <section>
                                <p className="text-stone-600 leading-relaxed text-lg">
                                    Les présentes conditions générales de vente (CGV) s'appliquent à toutes les commandes passées sur le site <span className="font-semibold text-stone-900">{name}</span> pour l'achat de produits avicoles et fermiers.
                                </p>
                            </section>

                            <hr className="border-stone-100" />

                            {/* Section 1: Produits */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                        <FileCheck className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">1. Les Produits</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Les produits proposés à la vente sont ceux décrits sur le site. Nous apportons le plus grand soin à la présentation et à la description de nos produits (œufs frais, poules, matériel d'élevage). Cependant, des variations minimes peuvent exister, notamment pour les produits vivants ou frais, sans que cela n'engage la responsabilité de {name}.
                                </p>
                            </section>

                            {/* Section 2: Commandes */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <ShoppingCart className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">2. Commande et Prix</h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-stone-600 marker:text-primary">
                                    <li>Les prix sont indiqués en FCFA (Franc CFA) toutes taxes comprises (TTC).</li>
                                    <li>{name} se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.</li>
                                    <li>La validation de la commande vaut acceptation des prix et descriptions des produits disponibles à la vente.</li>
                                </ul>
                            </section>

                            {/* Section 3: Paiement */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">3. Modalités de Paiement</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Le règlement des achats s'effectue via les moyens sécurisés suivants :
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-sm font-medium text-stone-700">
                                        Mobile Money (Orange / MTN)
                                    </div>
                                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-sm font-medium text-stone-700">
                                        Paiement à la livraison (sous conditions)
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Livraison */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                                        <Truck className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">4. Livraison</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Les livraisons sont faites à l'adresse indiquée sur le bon de commande. Les risques sont à la charge de l'acquéreur à compter du moment où les produits ont quitté les locaux de {name}.
                                </p>
                                <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-lg mt-2 border border-amber-100 flex gap-3">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p>En cas de dommage pendant le transport, la protestation motivée doit être formulée auprès du transporteur dans un délai de trois jours à compter de la livraison.</p>
                                </div>
                            </section>

                            {/* Section 5: Rétractation */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <RefreshCcw className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">5. Rétractation et Retours</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Conformément à la législation en vigueur, pour les produits périssables (œufs frais, denrées alimentaires), le droit de rétractation ne peut être exercé.
                                </p>
                                <p className="text-stone-600 leading-relaxed mt-2">
                                    Pour le matériel d'élevage non périssable, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation. Les frais de retour sont à votre charge.
                                </p>
                            </section>

                            {/* Section 6: Litiges */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-stone-900">6. Droit applicable</h2>
                                </div>
                                <p className="text-stone-600 leading-relaxed">
                                    Les présentes conditions générales de vente sont soumises à la loi camerounaise. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux compétents seront ceux de Yaoundé.
                                </p>
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
