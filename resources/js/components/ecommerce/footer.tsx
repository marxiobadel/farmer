import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-stone-950 py-16 text-stone-400 border-t border-stone-900">
            <div className="container max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-4 md:grid-cols-2">

                {/* Brand Column */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold">M</span>
                        </div>
                        <span className="text-2xl font-bold text-stone-100 tracking-tight">Montview Farm</span>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
                        L'excellence de l'élevage local. Des produits sains, une traçabilité totale et un engagement fort auprès des communautés agricoles.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                            <Instagram className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="font-bold text-stone-100 mb-6">Navigation</h4>
                    <ul className="space-y-4 text-sm">
                        {['Nos Produits', 'L\'Élevage', 'Espace Pro', 'Blog & Recettes', 'Carrières'].map(item => (
                            <li key={item}>
                                <a href="#" className="hover:text-primary hover:pl-1 transition-all duration-200 block">
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 className="font-bold text-stone-100 mb-6">Nous contacter</h4>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-stone-300 font-medium">+237 600 000 000</p>
                                <p className="text-xs">Lun-Sam : 8h-18h</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-primary mt-0.5" />
                            <a href="mailto:pro@montview.cm" className="hover:text-white transition-colors">pro@montview.cm</a>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <p>Route Nationale 3,<br/>Région du Centre, Cameroun</p>
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-bold text-stone-100 mb-6">Newsletter</h4>
                    <p className="text-xs mb-4">Recevez nos offres spéciales revendeurs.</p>
                    <form className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email professionnel..."
                            className="w-full rounded-lg border border-stone-800 bg-stone-900 px-4 py-3 text-sm text-stone-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-600"
                        />
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                            S'inscrire
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                <p>© {new Date().getFullYear()} Montview Farm. Tous droits réservés.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white">Mentions légales</a>
                    <a href="#" className="hover:text-white">CGV</a>
                    <a href="#" className="hover:text-white">Confidentialité</a>
                </div>
            </div>
        </footer>
    );
};
