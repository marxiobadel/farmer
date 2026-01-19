import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { motion, Variants } from "framer-motion";
import { Mail, MapPin, Phone, Send, MessageSquare, User, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FormEventHandler } from "react";
import contact from "@/routes/contact";
import { SharedData } from "@/types";
import { privacy } from "@/routes";
import GoogleMap from "@/components/ecommerce/google-map";

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

export default function Contact() {
    const { settings, auth } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: auth.user?.fullname || '',
        email: auth.user?.email || '',
        message: ''
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(contact.store().url, {
            preserveScroll: 'errors',
            preserveState: true,
            onSuccess: () => {
                reset();
                toast.success("Message envoyé !", {
                    description: "Nous reviendrons vers vous dans les plus brefs délais."
                });
            },
            onError: () => {
                toast.error("Erreur", {
                    description: "Veuillez vérifier les champs du formulaire."
                });
            }
        });
    };

    return (
        <AppLayout layout="guest">
            <Head title="Contactez-nous" />

            {/* --- HERO SECTION (Style About) --- */}
            <div className="relative bg-stone-900 overflow-hidden isolate">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 opacity-90" />
                    <svg className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                        <defs>
                            <pattern id="contact-pattern" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" strokeWidth={0} fill="url(#contact-pattern)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative z-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                                    Support Client & Partenariats
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-serif"
                            >
                                Restons en <span className="text-primary">Contact</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="mt-6 text-lg leading-8 text-stone-300"
                            >
                                Une question sur nos produits ? Une demande de partenariat ?
                                Notre équipe est là pour vous écouter et vous accompagner dans vos projets.
                            </motion.p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* --- CONTENU PRINCIPAL --- */}
            <div className="bg-white py-20 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Colonne Gauche : Infos */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif">
                                Discutons de vos besoins
                            </h2>
                            <p className="mt-4 text-lg text-stone-600">
                                Que vous soyez un professionnel de la restauration ou un particulier, nous sommes ravis d'échanger avec vous.
                            </p>

                            <div className="mt-10 space-y-8">
                                {settings.phone && (
                                    <div className="flex gap-4 group">
                                        <div className="flex-none w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-stone-900">Téléphone</h3>
                                            <a href={`tel:${settings.phone}`} className="text-primary font-medium hover:underline mt-1 block">
                                                {settings.phone}
                                            </a>
                                        </div>
                                    </div>)}

                                {settings.email && (
                                    <div className="flex gap-4 group">
                                        <div className="flex-none w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-stone-900">E-mail</h3>
                                            <p className="text-stone-600 mt-1">Pour toute demande écrite</p>
                                            <a href={`mailto:${settings.email}`} className="text-primary font-medium hover:underline mt-1 block">
                                                {settings.email}
                                            </a>
                                        </div>
                                    </div>)}

                                {settings.address && (
                                    <div className="flex gap-4 group">
                                        <div className="flex-none w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-stone-900">La Ferme</h3>
                                            <p className="text-stone-600 mt-1">
                                                {settings.address}
                                            </p>
                                        </div>
                                    </div>)}
                                <div className="flex gap-4 group">
                                    <div className="flex-none w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-stone-900">Boutique</h3>
                                        <p className="text-stone-600 mt-1">
                                            Marché central Bangangté
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Colonne Droite : Formulaire Professionnel */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-stone-50 rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200"
                        >
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-2 font-serif">
                                    Envoyez-nous un message
                                </h3>
                                <p className="text-stone-500 mt-2">
                                    Remplissez le formulaire ci-dessous et nous vous répondrons sous 24h.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Grille pour Nom et Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-stone-700">Nom complet <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                onFocus={() => clearErrors('name')}
                                                className="pl-10 bg-white border-stone-200 focus:border-primary focus:ring-primary focus:ring-0 py-4"
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-stone-700">E-mail professionnel <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                onFocus={() => clearErrors('email')}
                                                className="pl-10 bg-white border-stone-200 focus:border-primary focus:ring-primary py-4"
                                                placeholder="nom@entreprise.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-stone-700">Votre message <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none text-stone-400">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            onFocus={() => clearErrors('message')}
                                            className="pl-10 min-h-[100px] bg-white border-stone-200 focus:border-primary focus:ring-primary resize-none leading-relaxed"
                                            placeholder="Bonjour, je souhaiterais obtenir des informations concernant..."
                                        />
                                    </div>
                                    {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5 text-md rounded-xl shadow-sm shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Envoi en cours...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Envoyer le message <Send className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>

                                <p className="text-xs text-stone-400 text-center pt-2">
                                    En envoyant ce formulaire, vous acceptez notre <Link href={privacy()} className="underline hover:text-primary transition-colors">politique de confidentialité</Link>.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                    {/* Carte Google Maps Embed */}
                    <div className="mt-10 md:mt-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative group">
                        <GoogleMap />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
