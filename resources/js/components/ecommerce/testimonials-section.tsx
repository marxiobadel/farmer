import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePage } from "@inertiajs/react";
import { SharedData, Testimonial } from "@/types";
import { formatName } from "@/lib/utils";
import { useInitials } from "@/hooks/use-initials";

export const TestimonialsSection = () => {
    const props = usePage<SharedData>().props;
    const testimonials = (props.testimonials as Testimonial[]) || [];

    const getInitials = useInitials();

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
                                    "{testimonial.message}"
                                </p>
                            </div>
                            <div className="mt-8 flex items-center gap-x-4">
                                <Avatar>
                                    <AvatarImage className="object-cover" src={testimonial.user?.avatar_url ?? ''} />
                                    <AvatarFallback className="bg-primary text-white">{getInitials(testimonial.user?.fullname ?? 'M')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-white">{formatName(testimonial.user?.fullname ?? '')}</div>
                                    <div className="text-sm leading-6 text-stone-400">{testimonial.position ?? testimonial.user?.email}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
