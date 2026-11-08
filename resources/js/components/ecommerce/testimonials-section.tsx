import { motion, type Variants } from "framer-motion";
import { Quote, Star, BadgeCheck, Utensils, Hotel, Croissant, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePage } from "@inertiajs/react";
import { SharedData, Testimonial } from "@/types";
import { formatName } from "@/lib/utils";
import { useInitials } from "@/hooks/use-initials";

// Realistic fallbacks tailored for African local commerce & food service
const defaultTestimonials = [
    {
        id: 1,
        message:
            "La constance du calibre et la fraîcheur des œufs ont nettement amélioré la texture de nos génoises et viennoiseries. Les livraisons à l'aube nous évitent toute rupture de stock en cuisine.",
        position: "Chef Pâtissière • Boulangerie Le Régal",
        user: {
            fullname: "Nathalie Mvondo",
            avatar_url:
                "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=160&h=160&q=80",
        },
    },
    {
        id: 2,
        message:
            "Nous commandons plus de 40 plateaux chaque semaine pour nos buffets petit-déjeuner. Qualité sanitaire irréprochable, traçabilité nette et service commercial toujours disponible sur WhatsApp.",
        position: "Directeur F&B • Complexe Hôtelier Étoile",
        user: {
            fullname: "Samuel Kamga",
            avatar_url:
                "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=160&h=160&q=80",
        },
    },
    {
        id: 3,
        message:
            "La différence avec les circuits informels est incomparable. Les jaunes sont fermes et dorés, les poules bien nourries, et le tarif dégressif nous permet de garder nos marges compétitives.",
        position: "Chef Restauratrice • La Marmite Royale",
        user: {
            fullname: "Aïcha Diallo",
            avatar_url:
                "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=160&h=160&q=80",
        },
    },
] as unknown as Testimonial[];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    },
};

const getRoleIcon = (position?: string) => {
    const p = (position || "").toLowerCase();
    if (p.includes("hôtel") || p.includes("hotel")) return Hotel;
    if (p.includes("boulanger") || p.includes("pâtissier")) return Croissant;
    if (p.includes("restaurant") || p.includes("chef")) return Utensils;
    return Users;
};

export const TestimonialsSection = () => {
    const props = usePage<SharedData>().props;
    const rawTestimonials = (props.testimonials as Testimonial[]) || [];
    const testimonials = rawTestimonials.length > 0 ? rawTestimonials : defaultTestimonials;

    const getInitials = useInitials();

    return (
        <section className="relative overflow-hidden bg-stone-950 py-20 sm:py-28 text-white">
            {/* Background radial atmosphere */}
            <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
                <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-amber-600/15 blur-[140px]" />
            </div>

            <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl text-center mb-14 sm:mb-20">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-md">
                        <BadgeCheck className="h-4 w-4" />
                        <span>Retours Partenaires & Clients</span>
                    </div>

                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                        La confiance des tables & commerces exigeants
                    </h2>

                    <p className="mt-4 text-base sm:text-lg text-stone-400 leading-relaxed">
                        Hôteliers, traiteurs et maîtres artisans partagent leur expérience sur la fraîcheur de nos pontes et la régularité de nos tournées.
                    </p>

                    {/* Social Proof Stats Ribbon */}
                    <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-stone-300 backdrop-blur-md">
                        <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                        </div>
                        <span className="font-bold text-white">4.9 / 5</span>
                        <span className="text-stone-500">•</span>
                        <span>+450 livraisons régulières garanties</span>
                    </div>
                </div>

                {/* Testimonials Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                >
                    {testimonials.map((testimonial, index) => {
                        const Icon = getRoleIcon(testimonial.position);
                        const userFullname = testimonial.user?.fullname || "Client Partenaire";
                        const roleDescription = testimonial.position || "Client Vérifié";

                        return (
                            <motion.article
                                key={testimonial.id ?? index}
                                variants={cardVariants}
                                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-primary/10"
                            >
                                {/* Decorative Top Elements */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                            <Quote className="h-5 w-5" />
                                        </div>

                                        <div className="flex items-center text-amber-400 gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Message Quote */}
                                    <blockquote className="mt-6 text-sm sm:text-base leading-relaxed text-stone-300 font-normal">
                                        « {testimonial.message} »
                                    </blockquote>
                                </div>

                                {/* Author Metadata Footer */}
                                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <Avatar className="h-11 w-11 shrink-0 border border-white/20 ring-2 ring-primary/20">
                                            <AvatarImage
                                                className="object-cover"
                                                src={testimonial.user?.avatar_url ?? ""}
                                                alt={userFullname}
                                            />
                                            <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                                                {getInitials(userFullname)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 font-bold text-white text-sm truncate">
                                                <span>{formatName(userFullname)}</span>
                                                <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                            </div>
                                            <p className="text-xs text-stone-400 truncate mt-0.5">
                                                {roleDescription}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sector Icon Indicator */}
                                    <div
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-stone-400 group-hover:text-primary transition-colors"
                                        title={roleDescription}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
