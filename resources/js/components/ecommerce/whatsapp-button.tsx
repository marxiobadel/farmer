import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Clock, CheckCheck } from "lucide-react";

interface WhatsAppButtonProps {
    phoneNumber?: string; // ex: "237658265032"
    companyName?: string;
    agentName?: string;
    agentRole?: string;
    avatarUrl?: string;
    defaultMessage?: string;
    quickPrompts?: string[];
}

export default function WhatsAppButton({
    phoneNumber = "237658265032",
    companyName = "Ferme Avicole",
    agentName = "Koffi",
    agentRole = "Service Client & Commandes",
    avatarUrl = "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&h=120&q=80",
    defaultMessage = "Bonjour, j'aimerais avoir des informations sur vos produits et disponibilités.",
    quickPrompts = [
        "🥚 Prix du plateau d'œufs frais",
        "🚚 Tarifs et délais de livraison",
        "💼 Tarifs de gros pour restaurants",
    ],
}: WhatsAppButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [customText, setCustomText] = useState("");

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");

    // Auto-reveal teaser pulse after 3 seconds on page load
    useEffect(() => {
        const timer = setTimeout(() => {
            // Keep unread indicator visible until clicked
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const sendWhatsApp = (msg: string) => {
        const textToSend = msg.trim() || defaultMessage;
        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        setIsOpen(false);
    };

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
        if (hasUnread) setHasUnread(false);
    };

    return (
        <aside
            aria-label="Contactez-nous sur WhatsApp"
            className="fixed bottom-6 right-5 z-50 flex flex-col items-end"
        >
            {/* Floating Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-4 w-[340px] sm:w-[380px] overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header with Agent Info */}
                        <div className="relative bg-gradient-to-r from-emerald-600 to-[#128C7E] p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={avatarUrl}
                                            alt={agentName}
                                            className="h-11 w-11 rounded-full border-2 border-white/60 object-cover shadow-sm"
                                        />
                                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-emerald-700 bg-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-white">{agentName}</h4>
                                            <span className="text-[10px] rounded-full bg-white/20 px-1.5 py-0.2 font-medium">
                                                {companyName}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/80">{agentRole}</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                    aria-label="Fermer la fenêtre de chat"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Status banner */}
                            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/90">
                                <Clock className="h-3 w-3 text-emerald-200" />
                                <span>En ligne • Répond généralement en moins de 15 min</span>
                            </div>
                        </div>

                        {/* Conversation Body */}
                        <div className="space-y-3.5 bg-muted/30 p-4">
                            {/* Agent Bubble */}
                            <div className="flex gap-2.5">
                                <div className="flex max-w-[85%] flex-col gap-1 rounded-2xl rounded-tl-sm bg-card p-3.5 text-xs text-foreground shadow-xs border border-border/60">
                                    <p className="leading-relaxed">
                                        Bonjour 👋 ! Bienvenue chez <strong>{companyName}</strong>.
                                        Que souhaitez-vous commander ou savoir aujourd'hui ?
                                    </p>
                                    <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground mt-0.5">
                                        <span>À l'instant</span>
                                        <CheckCheck className="h-3 w-3 text-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Prompts Pills */}
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-primary" /> Suggestions rapides
                                </span>
                                <div className="flex flex-col gap-1.5">
                                    {quickPrompts.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => sendWhatsApp(prompt)}
                                            className="group flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-left text-xs text-foreground transition-all duration-150 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-300"
                                        >
                                            <span className="line-clamp-1">{prompt}</span>
                                            <Send className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 text-emerald-600" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Custom Input Bar */}
                        <div className="border-t border-border bg-card p-3">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendWhatsApp(customText);
                                }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="Tapez votre message..."
                                    className="h-10 flex-1 rounded-full border border-border bg-background px-3.5 text-xs text-foreground outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                    type="submit"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                                    aria-label="Envoyer sur WhatsApp"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <div className="group relative flex items-center">
                {/* Hover Pill Teaser on Desktop */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mr-3 hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span>Besoin d'aide ? Discutons</span>
                    </motion.div>
                )}

                {/* The Button */}
                <button
                    type="button"
                    onClick={handleToggle}
                    className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-600/40 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
                    aria-expanded={isOpen}
                    aria-label="Ouvrir la discussion WhatsApp"
                >
                    {/* Animated ping ring */}
                    <span className="absolute -inset-1 -z-10 animate-pulse rounded-full bg-emerald-500/20 blur-sm" />

                    {/* Unread badge */}
                    {hasUnread && !isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
                            1
                        </span>
                    )}

                    {isOpen ? (
                        <X className="h-6 w-6 transition-transform duration-200" />
                    ) : (
                        <WhatsAppIcon className="h-7 w-7 fill-current drop-shadow-xs" />
                    )}
                </button>
            </div>
        </aside>
    );
}

// Reusable Optimized WhatsApp SVG
const WhatsAppIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C16.58 3.67 20.28 7.37 20.28 11.91C20.28 16.45 16.58 20.15 12.04 20.15ZM16.56 14.39C16.31 14.26 15.09 13.66 14.86 13.58C14.64 13.49 14.47 13.45 14.31 13.7C14.14 13.95 13.66 14.51 13.51 14.68C13.37 14.84 13.22 14.86 12.97 14.74C12.72 14.61 11.92 14.35 10.97 13.5C10.23 12.84 9.73 12.03 9.58 11.78C9.44 11.53 9.57 11.4 9.69 11.27C9.8 11.16 9.94 10.98 10.06 10.84C10.19 10.69 10.23 10.59 10.31 10.42C10.39 10.25 10.35 10.11 10.29 9.98C10.23 9.85 9.73 8.63 9.52 8.13C9.32 7.64 9.12 7.71 8.97 7.7C8.83 7.69 8.66 7.69 8.5 7.69C8.33 7.69 8.06 7.75 7.83 8C7.6 8.25 6.96 8.85 6.96 10.07C6.96 11.29 7.85 12.47 7.97 12.63C8.1 12.8 9.72 15.3 12.21 16.37C12.8 16.63 13.26 16.78 13.62 16.9C14.22 17.09 14.76 17.06 15.19 17C15.67 16.93 16.66 16.4 16.87 15.82C17.08 15.24 17.08 14.74 17.01 14.63C16.95 14.52 16.81 14.51 16.56 14.39Z" />
    </svg>
);
