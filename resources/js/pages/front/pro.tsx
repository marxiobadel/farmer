import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { motion, Variants } from "framer-motion";
import { Briefcase, Building2, Truck, Percent, FileCheck, Users, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FormEventHandler } from "react";
import pro from "@/routes/pro";
import { login } from "@/routes";
import { businessTypes } from "@/data";

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
            staggerChildren: 0.1
        }
    }
};

export default function ProPage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        niu: '',
        contact_name: '',
        email: '',
        phone: '',
        activity_sector: '',
        address: '',
        message: ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(pro.store().url, {
            preserveScroll: 'errors',
            preserveState: true,
            onSuccess: () => {
                reset();
                toast.success("Demande envoyée !", {
                    description: "Un conseiller Pro vous recontactera très bientôt."
                });
            },
            onError: () => {
                toast.error("Erreur", {
                    description: "Veuillez vérifier les informations de votre entreprise."
                });
            }
        });
    };

    return (
        <AppLayout layout="guest">
            <Head title="Espace Pro" />

            {/* --- HERO SECTION (Dark & Gold/Premium vibe) --- */}
            <div className="relative bg-stone-950 overflow-hidden isolate">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 opacity-95" />
                    <svg className="absolute inset-0 h-full w-full stroke-white/5 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                        <defs>
                            <pattern id="pro-pattern" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" strokeWidth={0} fill="url(#pro-pattern)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative z-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold leading-6 text-amber-500 ring-1 ring-inset ring-amber-500/20">
                                    Offre B2B & Grossistes
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-serif"
                            >
                                Devenez partenaire <br /> <span className="text-amber-500">MontView Pro</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="mt-6 text-lg leading-8 text-stone-400"
                            >
                                Restaurants, Hôtels, Boulangeries, Revendeurs : profitez de tarifs préférentiels et d'une chaîne logistique dédiée à votre réussite.
                            </motion.p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* --- AVANTAGES PRO --- */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: Percent,
                                title: "Tarifs Grossistes",
                                desc: "Accédez à une grille tarifaire exclusive avec des remises sur volume adaptées à votre activité."
                            },
                            {
                                icon: Truck,
                                title: "Livraison Prioritaire",
                                desc: "Vos commandes sont traitées en priorité. Livraison tôt le matin pour garantir la fraîcheur."
                            },
                            {
                                icon: Users,
                                title: "Service Dédié",
                                desc: "Un account manager unique pour gérer vos commandes, factures et besoins spécifiques."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:shadow-lg transition-all duration-300">
                                <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-3">{item.title}</h3>
                                <p className="text-stone-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- FORMULAIRE D'OUVERTURE --- */}
            <div className="bg-stone-50 py-20 sm:py-24 border-t border-stone-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 grid lg:grid-cols-5">

                        {/* Sidebar Info */}
                        <div className="lg:col-span-2 bg-stone-900 p-4 sm:p-6 md:p-10 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold font-serif mb-6">Critères d'éligibilité</h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-3 items-start">
                                        <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="text-stone-300 text-sm">Être une entreprise enregistrée (NIU valide).</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="text-stone-300 text-sm">Volume de commande minimum (ex: 10 alvéoles/semaine).</span>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="text-stone-300 text-sm">Localisation dans nos zones de livraison pro.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-10 pt-10 border-t border-stone-800">
                                <p className="text-sm text-stone-400">Déjà client Pro ?</p>
                                <Link href={login()} className="text-amber-500 font-semibold hover:underline mt-1 block">
                                    Connectez-vous à votre espace
                                </Link>
                            </div>
                        </div>

                        {/* Formulaire */}
                        <div className="lg:col-span-3 p-4 sm:p-6 md:p-10">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-stone-900">Demande d'ouverture de compte</h2>
                                <p className="text-stone-500 text-sm mt-1">Remplissez ce formulaire pour recevoir votre accès.</p>
                            </div>

                            <form onSubmit={submit} className="space-y-5">
                                {/* Société & NIU */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Raison Sociale *</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-[9.5px] h-4 w-4 text-stone-400" />
                                            <Input
                                                id="company_name"
                                                className="pl-9 bg-stone-50 border-stone-200"
                                                placeholder="Nom de l'entreprise"
                                                value={data.company_name}
                                                onChange={e => setData('company_name', e.target.value)}
                                            />
                                        </div>
                                        {errors.company_name && <p className="text-xs text-red-500">{errors.company_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="niu">Numéro Contribuable (NIU)</Label>
                                        <div className="relative">
                                            <FileCheck className="absolute left-3 top-[9.5px] h-4 w-4 text-stone-400" />
                                            <Input
                                                id="niu"
                                                className="pl-9 bg-stone-50 border-stone-200"
                                                placeholder="M052..."
                                                value={data.niu}
                                                onChange={e => setData('niu', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="space-y-2">
                                    <Label htmlFor="contact_name">Nom du Gérant / Responsable *</Label>
                                    <Input
                                        id="contact_name"
                                        className="bg-stone-50 border-stone-200"
                                        placeholder="Votre nom complet"
                                        value={data.contact_name}
                                        onChange={e => setData('contact_name', e.target.value)}
                                    />
                                    {errors.contact_name && <p className="text-xs text-red-500">{errors.contact_name}</p>}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Pro *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="bg-stone-50 border-stone-200"
                                            placeholder="contact@entreprise.cm"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                        />
                                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Téléphone *</Label>
                                        <Input
                                            id="phone"
                                            className="bg-stone-50 border-stone-200"
                                            placeholder="6XX XX XX XX"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                        />
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Secteur & Adresse */}
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label>Secteur d'activité *</Label>
                                        <Select onValueChange={val => setData('activity_sector', val)}>
                                            <SelectTrigger className="bg-stone-50 border-stone-200">
                                                <SelectValue placeholder="Choisir..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {businessTypes.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.activity_sector && <p className="text-xs text-red-500">{errors.activity_sector}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Ville & Quartier *</Label>
                                        <Input
                                            id="address"
                                            className="bg-stone-50 border-stone-200"
                                            placeholder="Ex: Yaoundé, Bastos"
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                        />
                                        {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Besoin spécifique (Optionnel)</Label>
                                    <Textarea
                                        id="message"
                                        className="bg-stone-50 border-stone-200 min-h-[100px]"
                                        placeholder="Volume estimé, fréquence de livraison souhaitée..."
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 text-base"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Traitement...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Envoyer la demande <Briefcase className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
