import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        content: "Depuis que nous utilisons les œufs Montview pour nos pâtisseries, la qualité de nos gâteaux a fait un bond. Les jaunes sont d'une couleur incroyable !",
        author: "Amadou K.",
        role: "Chef Pâtissier, Le Palais Gourmand",
        image: "https://i.pravatar.cc/150?u=a",
    },
    {
        content: "Un fournisseur fiable. Les livraisons sont toujours à l'heure, et le taux de casse est quasi inexistant grâce à leur conditionnement soigné.",
        author: "Sarah M.",
        role: "Gérante, Supermarché Eco",
        image: "https://i.pravatar.cc/150?u=s",
    },
    {
        content: "J'achète mes poules de réforme ici chaque année. Elles sont en excellente santé et bien dodues. La meilleure ferme de la région.",
        author: "Jean-Paul B.",
        role: "Revendeur Volailles",
        image: "https://i.pravatar.cc/150?u=j",
    }
];

export const TestimonialsSection = () => {
    return (
        <section className="bg-stone-900 py-16 sm:py-20 md:py-24 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute right-0 top-0 -translate-y-1/2 w-96 h-96 bg-primary rounded-full blur-[120px]" />
                <div className="absolute left-0 bottom-0 translate-y-1/2 w-96 h-96 bg-amber-500 rounded-full blur-[120px]" />
            </div>

            <div className="container max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-primary font-semibold tracking-wide uppercase">Témoignages</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ils font confiance à notre qualité
                    </p>
                </div>

                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            className="flex flex-col justify-between bg-stone-800/50 backdrop-blur-sm p-8 rounded-2xl border border-stone-700 hover:border-primary/50 transition-colors"
                        >
                            <div>
                                <Quote className="h-8 w-8 text-primary/40 mb-4" />
                                <p className="text-lg leading-relaxed text-stone-300">
                                    "{testimonial.content}"
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-x-4">
                                <Avatar>
                                    <AvatarImage src={testimonial.image} />
                                    <AvatarFallback className="bg-primary text-white">{testimonial.author[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-white">{testimonial.author}</div>
                                    <div className="text-sm leading-6 text-stone-400">{testimonial.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
