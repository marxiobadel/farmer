import { useState, useEffect, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gift,
    X,
    Sparkles,
    Copy,
    Check,
    MessageCircle,
    Mail,
    Loader2,
    ArrowRight,
    ShieldCheck,
    AlertCircle,
    Clock,
    Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/bootstrap";
import { SharedData, Coupon } from "@/types";
import { COUNTRY_DIAL_CODES } from "@/data";
import leads from "@/routes/leads";

interface LeadDiscountModalProps {
    delaySeconds?: number;
}

export const LeadDiscountModal = ({ delaySeconds = 5 }: LeadDiscountModalProps) => {
    const { settings, defaultCurrency = "FCFA", auth } = usePage<SharedData>().props;

    const activeCoupon: Coupon | null = settings?.promo_coupon ?? null;

    // 1. Extraction et conversion numérique sécurisée (évite le crash toLocaleString)
    const couponNumericValue = useMemo(() => {
        if (!activeCoupon) return 0;

        // Passage par 'unknown' pour autoriser l'accès aux alias de colonnes
        const couponData = activeCoupon as unknown as Record<string, unknown>;
        const rawVal = couponData.value ?? couponData.amount ?? couponData.discount ?? 0;

        return typeof rawVal === "number" ? rawVal : Number(rawVal) || 0;
    }, [activeCoupon]);

    const minOrderAmount = useMemo(() => {
        if (!activeCoupon?.min_order_amount) return 0;
        return Number(activeCoupon.min_order_amount) || 0;
    }, [activeCoupon]);

    // 2. Validation complète du coupon
    const isValidCoupon = useMemo(() => {
        if (!activeCoupon || !activeCoupon.is_active || !activeCoupon.code) return false;
        if (couponNumericValue <= 0) return false;

        if (activeCoupon.expires_at) {
            const expiryTime = new Date(activeCoupon.expires_at).getTime();
            if (!isNaN(expiryTime) && Date.now() > expiryTime) return false;
        }

        if (
            activeCoupon.usage_limit !== null &&
            activeCoupon.usage_limit !== undefined &&
            Number(activeCoupon.usage_count) >= Number(activeCoupon.usage_limit)
        ) {
            return false;
        }

        return true;
    }, [activeCoupon, couponNumericValue]);

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [selectedCountryCode, setSelectedCountryCode] = useState("CM");

    const selectedCountry = useMemo(() => {
        return (
            COUNTRY_DIAL_CODES.find((c) => c.code === selectedCountryCode) ??
            COUNTRY_DIAL_CODES[0]
        );
    }, [selectedCountryCode]);

    const [formData, setFormData] = useState({
        firstname: auth?.user ? auth.user.firstname || "" : "",
        lastname: auth?.user ? auth.user.lastname || "" : "",
        email: auth?.user ? auth.user.email || "" : "",
        phone: "",
    });

    // 3. Libellés formatés garantis sans crash
    const discountValues = useMemo(() => {
        if (!activeCoupon || couponNumericValue <= 0) {
            return { badge: "", title: "", phrase: "" };
        }

        const isPercent = activeCoupon.type === "percent";
        const formattedAmount = couponNumericValue.toLocaleString("fr-FR");

        return {
            badge: isPercent ? `-${couponNumericValue}%` : `-${formattedAmount} ${defaultCurrency}`,
            title: isPercent
                ? `${couponNumericValue}% de réduction`
                : `${formattedAmount} ${defaultCurrency} de remise`,
            phrase: isPercent
                ? `une réduction de ${couponNumericValue}%`
                : `un bon d'achat de ${formattedAmount} ${defaultCurrency}`,
        };
    }, [activeCoupon, couponNumericValue, defaultCurrency]);

    const formattedExpiryDate = useMemo(() => {
        if (!activeCoupon?.expires_at) return null;
        const date = new Date(activeCoupon.expires_at);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
        });
    }, [activeCoupon]);

    const remainingUses = useMemo(() => {
        if (!activeCoupon?.usage_limit) return null;
        return Math.max(0, Number(activeCoupon.usage_limit) - Number(activeCoupon.usage_count || 0));
    }, [activeCoupon]);

    useEffect(() => {
        if (!isValidCoupon || !activeCoupon) return;

        const storageKey = `montview_lead_coupon_${activeCoupon.code}_dismissed`;
        const dismissedAt = localStorage.getItem(storageKey);
        if (dismissedAt) {
            const pastTime = parseInt(dismissedAt, 10);
            const daysPassed = (Date.now() - pastTime) / (1000 * 60 * 60 * 24);
            if (daysPassed < 7) return;
        }

        const timer = setTimeout(() => {
            setIsOpen(true);
        }, delaySeconds * 1000);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [delaySeconds, isValidCoupon, activeCoupon]);

    const handleClose = () => {
        setIsOpen(false);
        if (activeCoupon) {
            localStorage.setItem(
                `montview_lead_coupon_${activeCoupon.code}_dismissed`,
                Date.now().toString()
            );
        }
    };

    const handleCopyCode = () => {
        if (!activeCoupon?.code) return;
        navigator.clipboard.writeText(activeCoupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCoupon) return;

        setErrorMessage(null);

        if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.email.trim()) {
            setErrorMessage("Veuillez renseigner votre prénom, votre nom et votre adresse e-mail.");
            return;
        }

        let fullPhoneNumber: string | null = null;
        if (formData.phone.trim()) {
            const cleanDigits = formData.phone.replace(/[^0-9]/g, "").replace(/^0+/, "");
            if (cleanDigits.length < 6) {
                setErrorMessage("Veuillez saisir un numéro valide ou laisser le champ vide.");
                return;
            }
            fullPhoneNumber = `${selectedCountry.dial}${cleanDigits}`;
        }

        setIsSubmitting(true);
        try {
            await axiosInstance.post(leads.discount().url, {
                firstname: formData.firstname.trim(),
                lastname: formData.lastname.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: fullPhoneNumber,
                code: activeCoupon.code,
                coupon_id: activeCoupon.id,
            });

            localStorage.setItem(
                `montview_lead_coupon_${activeCoupon.code}_dismissed`,
                (Date.now() + 1000 * 60 * 60 * 24 * 365).toString()
            );

            setIsSuccess(true);

            // Met à jour la session utilisateur en arrière-plan sans détruire l'affichage du modal
            router.reload();
        } catch (error: any) {
            const serverMessage =
                error.response?.data?.message ||
                "Impossible d'enregistrer vos informations. Veuillez vérifier les champs.";
            setErrorMessage(serverMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isValidCoupon || !activeCoupon) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
                    {/* Backdrop sombre flouté */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                    />

                    {/* Modal Container avec gestion du scroll mobile */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
                        className="relative flex flex-col w-full max-w-lg max-h-[88dvh] rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl backdrop-blur-xl overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="discount-modal-title"
                    >
                        {/* Bouton Fermer */}
                        <button
                            onClick={handleClose}
                            type="button"
                            className="absolute right-3 top-3 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/55 active:scale-95"
                            aria-label="Fermer la fenêtre"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Zone défilable tactile fluide */}
                        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
                            {/* Header Gradient */}
                            <div className="relative bg-gradient-to-r from-amber-600 via-primary to-orange-600 px-5 py-6 sm:px-8 sm:py-7 text-primary-foreground">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    <span className="flex h-6 sm:h-7 items-center gap-1.5 rounded-full bg-white/20 px-2.5 sm:px-3 text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-200" />
                                        Offre Spéciale
                                    </span>

                                    {remainingUses !== null && remainingUses <= 50 && (
                                        <span className="flex h-6 sm:h-7 items-center gap-1 rounded-full bg-black/25 px-2.5 text-[10px] sm:text-[11px] font-bold text-amber-200 backdrop-blur-md">
                                            <Flame className="h-3 w-3 text-amber-400" />
                                            Plus que {remainingUses} dispos
                                        </span>
                                    )}
                                </div>

                                <h3
                                    id="discount-modal-title"
                                    className="mt-2.5 text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug sm:leading-tight"
                                >
                                    Recevez {discountValues.title} immédiate
                                </h3>

                                <p className="mt-1 text-xs sm:text-sm text-white/90 leading-relaxed">
                                    Inscrivez-vous pour obtenir votre code promo exclusif applicable sur nos œufs et volailles.
                                </p>

                                {/* Conditions du coupon */}
                                <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                    {minOrderAmount > 0 ? (
                                        <div className="inline-flex items-center gap-1 rounded-md bg-black/20 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-white/95">
                                            <Clock className="h-3 w-3 text-amber-300" />
                                            <span>
                                                Dès {minOrderAmount.toLocaleString("fr-FR")} {defaultCurrency} d'achat
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1 rounded-md bg-black/20 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-white/95">
                                            <Check className="h-3 w-3 text-emerald-300" />
                                            <span>Sans minimum d'achat</span>
                                        </div>
                                    )}

                                    {formattedExpiryDate && (
                                        <div className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-white">
                                            <span>Valable jusqu'au {formattedExpiryDate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Formulaire ou Écran de Succès */}
                            <div className="p-5 sm:p-7 md:p-8">
                                {!isSuccess ? (
                                    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                                        {errorMessage && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 rounded-xl bg-destructive/10 p-2.5 sm:p-3 text-xs font-medium text-destructive border border-destructive/20"
                                            >
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                <span>{errorMessage}</span>
                                            </motion.div>
                                        )}

                                        {/* Prénom & Nom */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1 text-left">
                                                <label className="text-xs font-bold text-foreground">
                                                    Prénom <span className="text-destructive">*</span>
                                                </label>
                                                <Input
                                                    required
                                                    autoComplete="given-name"
                                                    placeholder="Ex: Samuel"
                                                    value={formData.firstname}
                                                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                                    className="h-10 sm:h-11 rounded-xl border-border bg-background text-xs sm:text-sm"
                                                />
                                            </div>

                                            <div className="space-y-1 text-left">
                                                <label className="text-xs font-bold text-foreground">
                                                    Nom <span className="text-destructive">*</span>
                                                </label>
                                                <Input
                                                    required
                                                    autoComplete="family-name"
                                                    placeholder="Ex: Kamga"
                                                    value={formData.lastname}
                                                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                                    className="h-10 sm:h-11 rounded-xl border-border bg-background text-xs sm:text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* E-mail (Obligatoire) */}
                                        <div className="space-y-1 text-left">
                                            <label className="flex items-center justify-between text-xs font-bold text-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-primary" />
                                                    Adresse E-mail <span className="text-destructive">*</span>
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-normal">
                                                    Réception du code
                                                </span>
                                            </label>
                                            <Input
                                                required
                                                type="email"
                                                inputMode="email"
                                                autoComplete="email"
                                                placeholder="exemple@email.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="h-10 sm:h-11 rounded-xl border-border bg-background text-xs sm:text-sm"
                                            />
                                        </div>

                                        {/* Numéro WhatsApp */}
                                        <div className="space-y-1 text-left">
                                            <label className="flex items-center justify-between text-xs font-bold text-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                                                    Numéro WhatsApp
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-normal">
                                                    Copie par message
                                                </span>
                                            </label>

                                            <div className="flex rounded-xl border border-border bg-background shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                                {/* Sélecteur de pays */}
                                                <div className="relative shrink-0">
                                                    <select
                                                        value={selectedCountryCode}
                                                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                                                        className="h-10 sm:h-11 w-[96px] sm:w-[124px] appearance-none rounded-l-xl border-r border-border bg-muted/40 pl-2.5 pr-6 text-xs font-bold text-foreground outline-none cursor-pointer hover:bg-muted/70 transition-colors truncate"
                                                        aria-label="Sélectionner le pays"
                                                    >
                                                        {COUNTRY_DIAL_CODES.map((country) => (
                                                            <option
                                                                key={country.code}
                                                                value={country.code}
                                                                className="bg-card text-foreground py-1"
                                                            >
                                                                {country.flag} {country.dial} - {country.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">
                                                        ▼
                                                    </span>
                                                </div>

                                                {/* Champ téléphone */}
                                                <Input
                                                    type="tel"
                                                    inputMode="tel"
                                                    autoComplete="tel-national"
                                                    placeholder="6xx xxx xxx"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="h-10 sm:h-11 flex-1 rounded-l-none border-0 bg-transparent text-xs sm:text-sm shadow-none focus-visible:ring-0"
                                                />
                                            </div>
                                        </div>

                                        {/* Bouton Soumission */}
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="mt-1 h-11 sm:h-12 w-full rounded-xl bg-primary text-xs sm:text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-98"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Activation en cours...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span>Obtenir mon code {discountValues.badge}</span>
                                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                            <span>Zéro spam • Code délivré instantanément</span>
                                        </div>
                                    </form>
                                ) : (
                                    /* Écran de confirmation */
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4 text-center py-1"
                                    >
                                        <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                                            <Gift className="h-6 w-6 sm:h-7 sm:w-7" />
                                        </div>

                                        <div>
                                            <h4 className="text-lg sm:text-xl font-black text-foreground">
                                                Félicitations {formData.firstname} ! 🎉
                                            </h4>
                                            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                                                Votre code donnant droit à <strong>{discountValues.phrase}</strong> est prêt.
                                            </p>
                                        </div>

                                        {/* Cadre Code Promo */}
                                        <div className="relative flex items-center justify-between rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 p-3 sm:p-3.5">
                                            <div className="text-left">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                                    Code Promo Actif
                                                </span>
                                                <p className="font-mono text-lg sm:text-xl font-black text-primary tracking-wider">
                                                    {activeCoupon.code}
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleCopyCode}
                                                className="rounded-xl gap-1.5 font-bold shadow-xs text-xs"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                        <span>Copié</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5" />
                                                        <span>Copier</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Récapitulatif d'envoi */}
                                        <div className="rounded-xl bg-muted/50 p-3 text-left text-xs text-muted-foreground space-y-1.5">
                                            <div className="flex items-center gap-2 text-foreground font-semibold text-[11px] sm:text-xs">
                                                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span className="truncate">Copie envoyée à {formData.email}</span>
                                            </div>

                                            {formData.phone.trim() && (
                                                <div className="flex items-center gap-2 text-foreground font-semibold text-[11px] sm:text-xs pt-1 border-t border-border/40">
                                                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                    <span className="truncate">
                                                        Copie également envoyée au {selectedCountry.dial} {formData.phone}
                                                    </span>
                                                </div>
                                            )}

                                            <p className="text-[10px] sm:text-[11px] leading-relaxed pt-0.5">
                                                Le code <strong>{activeCoupon.code}</strong> vous a été transmis pour que vous puissiez le retrouver à tout moment.
                                            </p>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                handleClose();
                                                router.reload();
                                            }}
                                            className="w-full h-10 sm:h-11 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 text-xs sm:text-sm"
                                        >
                                            Découvrir les produits & commander
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
