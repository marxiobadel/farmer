import { Button } from "@/components/ui/button";
import { cgv, faqs, farming, legal, privacy } from "@/routes";
import newsletter from "@/routes/newsletter";
import { SharedData } from "@/types";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";

export const Footer = () => {
    const { settings, name } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(newsletter.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset("email");
                toast.success(<div className="flex flex-col">
                    <span className="font-semibold text-foreground">Succès</span>
                    <span className="text-sm text-muted-foreground">
                        Merci pour votre inscription à la newsletter !
                    </span>
                </div>);
            },
        });
    };

    return (
        <footer className="bg-stone-950 py-16 text-stone-400 border-t border-stone-900">
            <div className="container max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-4 md:grid-cols-2">

                {/* Brand Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold">M</span>
                        </div>
                        <span className="text-2xl font-bold text-stone-100 tracking-tight">{name}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
                        L'excellence de l'élevage local. Des produits sains, une traçabilité totale et un engagement fort auprès des communautés agricoles.
                    </p>
                    <div className="flex gap-4">
                        {settings?.facebook_url && (
                            <a href={settings.facebook_url} className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <Facebook className="h-5 w-5" />
                            </a>)}
                        {settings?.instagram_url && (
                            <a href={settings.instagram_url} className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <Instagram className="h-5 w-5" />
                            </a>)}
                        {settings?.youtube_url && (
                            <a href={settings.youtube_url} className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <Youtube className="h-5 w-5" />
                            </a>)}
                        {settings?.twitter_url && (
                            <a href={settings.twitter_url} className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <Twitter className="h-5 w-5" />
                            </a>)}
                        {settings?.linkedin_url && (
                            <a href={settings.linkedin_url} className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <Linkedin className="h-5 w-5" />
                            </a>)}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold text-stone-100 mb-6">Navigation</h4>
                    <ul className="space-y-4 text-sm">
                        <li>
                            <a href="#" className="hover:text-primary hover:pl-1 transition-all duration-200 block">
                                Nos Produits
                            </a>
                        </li>
                        <li>
                            <Link href={farming()} className="hover:text-primary hover:pl-1 transition-all duration-200 block">
                                L'Élevage
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary hover:pl-1 transition-all duration-200 block">
                                Espace Pro
                            </a>
                        </li>
                        <li>
                            <Link href={faqs()} className="hover:text-primary hover:pl-1 transition-all duration-200 block">
                                FAQs
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="font-bold text-stone-100 mb-6">Nous contacter</h4>
                    <div className="space-y-4 text-sm">
                        {settings?.phone && (
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-stone-300 font-medium">{settings.phone}</p>
                                    <p className="text-xs">Tous les jours : 8h-18h</p>
                                </div>
                            </div>)}
                        {settings?.email && (
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-primary mt-0.5" />
                                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">{settings.email}</a>
                            </div>)}
                        {settings?.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="h-7 w-7 text-primary mt-0.5" />
                                <p>{settings.address}</p>
                            </div>)}
                    </div>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-bold text-stone-100 mb-6">Newsletter</h4>
                    <p className="text-sm mb-4">Recevez nos offres spéciales revendeurs.</p>
                    <form className="flex flex-col gap-3" onSubmit={handleSubmit} role="form" aria-label="Newsletter subscription form">
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            onFocus={(e) => clearErrors("email")}
                            placeholder="Email professionnel..."
                            className="w-full rounded-lg border border-stone-800 bg-stone-900 px-4 py-3 text-sm text-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-600"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm">{errors.email}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                            S'inscrire
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                <p>© {new Date().getFullYear()} {name}. Tous droits réservés.</p>
                <div className="flex gap-6">
                    <Link href={legal()} className="hover:text-white">Mentions légales</Link>
                    <Link href={cgv()} className="hover:text-white">CGV</Link>
                    <Link href={privacy()} className="hover:text-white">Confidentialité</Link>
                </div>
            </div>
        </footer>
    );
};
