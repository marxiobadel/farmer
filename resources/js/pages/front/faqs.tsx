import AppLayout from "@/layouts/app-layout";
import { Head, InfiniteScroll, Link, usePage } from "@inertiajs/react";
import { motion, Variants } from "framer-motion";
import { HelpCircle, Search, MessageCircle, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { PaginationMeta, SharedData } from "@/types";
import { contact } from "@/routes";

// Types
interface Faq {
    id: number;
    question: string;
    answer: string;
}

interface Props {
    faqs: {
        data: Faq[];
        meta: PaginationMeta;
    };
}

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

export default function FaqPage({ faqs }: Props) {
     const { settings } = usePage<SharedData>().props;

    const [searchQuery, setSearchQuery] = useState("");

    // Filtrer les FAQs en fonction de la recherche
    const filteredFaqs = faqs.data.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout layout="guest">
            <Head title="Foire Aux Questions" />

            {/* --- HERO SECTION --- */}
            <div className="relative bg-stone-900 overflow-hidden isolate">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 opacity-90" />
                    <svg className="absolute inset-0 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                        <defs>
                            <pattern id="faq-pattern" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
                                <path d="M.5 200V.5H200" fill="none" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" strokeWidth={0} fill="url(#faq-pattern)" />
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
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                                    Centre d'aide
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-serif"
                            >
                                Questions <span className="text-primary">Fréquentes</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="mt-6 text-lg leading-8 text-stone-300"
                            >
                                Tout ce que vous devez savoir sur nos produits, nos livraisons et nos services pour les professionnels.
                            </motion.p>

                            {/* Barre de recherche */}
                            <motion.div
                                variants={fadeInUp}
                                className="mt-10 max-w-xl mx-auto relative"
                            >
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-stone-400" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Rechercher une question..."
                                    className="pl-11 py-6 bg-white/10 border-white/20 text-white placeholder:text-stone-400 focus:bg-white/20 rounded-full transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* --- CONTENU ACCORDÉON --- */}
            <div className="bg-white py-20 sm:py-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredFaqs.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            <InfiniteScroll data="faqs" className="space-y-4">
                                {filteredFaqs.map((faq, index) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <AccordionItem value={`item-${faq.id}`} className="last:border-b-1 border border-stone-200 rounded-xl px-4 sm:px-6 bg-stone-50 hover:bg-stone-50/80 transition-colors">
                                            <AccordionTrigger className="text-lg font-semibold text-stone-900 hover:no-underline py-4 sm:py-6">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-stone-600 text-base leading-relaxed pb-6">
                                                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </motion.div>
                                ))}
                            </InfiniteScroll>
                        </Accordion>
                    ) : (
                        <div className="text-center py-12">
                            <HelpCircle className="mx-auto h-12 w-12 text-stone-300" />
                            <h3 className="mt-4 text-lg font-semibold text-stone-900">Aucune réponse trouvée</h3>
                            <p className="mt-2 text-stone-500">Essayez de reformuler votre recherche ou contactez-nous directement.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- STILL HAVE QUESTIONS? --- */}
            <section className="bg-stone-50 border-t border-stone-200 py-20 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-stone-900 font-serif mb-6">
                        Vous n'avez pas trouvé votre réponse ?
                    </h2>
                    <p className="text-lg text-stone-600 mb-10 max-w-2xl mx-auto">
                        Notre équipe est disponible pour répondre à toutes vos interrogations concernant nos élevages et nos produits.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Link href={contact()} className="group bg-white p-8 rounded-2xl border border-stone-200 hover:shadow-sm transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-stone-900 text-lg mb-2">Envoyer un message</h3>
                            <p className="text-stone-500 text-sm">Réponse sous 24h via notre formulaire</p>
                        </Link>

                        <a href={`tel:+${settings?.phone}`} className="group bg-white p-8 rounded-2xl border border-stone-200 hover:shadow-sm transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Phone className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-stone-900 text-lg mb-2">Appelez-nous</h3>
                            <p className="text-stone-500 text-sm">Tous les jours, 8h-18h</p>
                        </a>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
