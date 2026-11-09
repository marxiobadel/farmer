import { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    User,
    Mail,
    Lock,
    CheckCircle2,
    ShieldCheck,
    Truck,
    Building2,
    Check,
} from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { COUNTRY_DIAL_CODES } from '@/data';
import { playToastSound } from '@/lib/utils';

const stepVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 20 : -20,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1],
        },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 20 : -20,
        opacity: 0,
        transition: {
            duration: 0.18,
            ease: 'easeIn',
        },
    }),
};

export default function Register() {
    const [step, setStep] = useState<1 | 2>(1);
    const [direction, setDirection] = useState<number>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);

    // Sélecteur d'indicatif pays (+237 par défaut)
    const [selectedCountryCode, setSelectedCountryCode] = useState('CM');

    const selectedCountry = useMemo(() => {
        return (
            COUNTRY_DIAL_CODES.find((c) => c.code === selectedCountryCode) ??
            COUNTRY_DIAL_CODES[0]
        );
    }, [selectedCountryCode]);

    const form = useForm({
        lastname: '',
        firstname: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Indicateur de concordance des mots de passe
    const passwordsMatch = useMemo(() => {
        if (!form.data.password || !form.data.password_confirmation) return null;
        return form.data.password === form.data.password_confirmation;
    }, [form.data.password, form.data.password_confirmation]);

    // Validation locale de l'étape 1 avant de passer à l'étape 2
    const handleNextStep = () => {
        let hasError = false;

        if (!form.data.firstname.trim()) {
            form.setError('firstname', 'Veuillez saisir votre prénom.');
            hasError = true;
        }

        if (!form.data.lastname.trim()) {
            form.setError('lastname', 'Veuillez saisir votre nom.');
            hasError = true;
        }

        const rawPhone = form.data.phone.replace(/[^0-9]/g, '').replace(/^0+/, '');
        if (rawPhone && rawPhone.length < 6) {
            form.setError('phone', 'Veuillez saisir un numéro de téléphone valide.');
            hasError = true;
        }

        if (hasError) return;

        setDirection(1);
        setStep(2);
    };

    const handlePrevStep = () => {
        setDirection(-1);
        setStep(1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Formatage international E.164 du numéro de téléphone
        const cleanDigits = form.data.phone.replace(/[^0-9]/g, '').replace(/^0+/, '');
        const fullPhone = cleanDigits ? `${selectedCountry.dial}${cleanDigits}` : '';

        form.transform((data) => ({
            ...data,
            firstname: data.firstname.trim(),
            lastname: data.lastname.trim(),
            email: data.email.trim().toLowerCase(),
            phone: fullPhone || data.phone,
        }));

        form.post(store.form().action, {
            preserveState: true,
            preserveScroll: 'errors',
            onError: () => {
                toast('Erreur lors de la création du compte', {
                    description: 'Vérifiez les informations saisies et réessayez.',
                    className: 'border border-destructive/20 bg-card text-foreground shadow-lg',
                    onAutoClose: () => playToastSound(),
                });
            },
            onSuccess: () => {
                form.reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <AuthLayout
            title="Créer votre compte client"
            description="Rejoignez MontView pour commander vos œufs frais, suivre vos livraisons et accéder aux grilles tarifaires dégressives."
        >
            <Head title="Créer un compte sécurisé" />

            {/* --- Indicateur d'Étapes Moderne & Barre de Progression --- */}
            <div className="mb-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`flex items-center gap-1.5 transition-colors ${step === 1 ? 'text-primary' : 'text-foreground'}`}>
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-emerald-500 text-white'}`}>
                            {step > 1 ? <Check className="h-3 w-3 stroke-[3]" /> : '1'}
                        </span>
                        Coordonnées
                    </span>
                    <span className="text-muted-foreground/40">• • •</span>
                    <span className={`flex items-center gap-1.5 transition-colors ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            2
                        </span>
                        Sécurité du compte
                    </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: '50%' }}
                        animate={{ width: step === 1 ? '50%' : '100%' }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <AnimatePresence mode="wait" custom={direction}>
                    {/* ---------- ÉTAPE 1 : COORDONNÉES & CONTACT ---------- */}
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="grid gap-4"
                        >
                            {/* Ligne Nom & Prénom en grille responsive */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="grid gap-1.5 text-left">
                                    <Label htmlFor="firstname" className="text-xs font-bold text-foreground">
                                        Prénom <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative flex items-center">
                                        <User className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="firstname"
                                            name="firstname"
                                            autoFocus
                                            value={form.data.firstname}
                                            onChange={(e) => form.setData('firstname', e.target.value)}
                                            onFocus={() => form.clearErrors('firstname')}
                                            autoComplete="given-name"
                                            placeholder="Ex: Samuel"
                                            className="h-11 rounded-xl border-border bg-background pl-10 text-sm text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                                        />
                                    </div>
                                    <InputError message={form.errors.firstname} />
                                </div>

                                <div className="grid gap-1.5 text-left">
                                    <Label htmlFor="lastname" className="text-xs font-bold text-foreground">
                                        Nom <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="lastname"
                                        name="lastname"
                                        value={form.data.lastname}
                                        onChange={(e) => form.setData('lastname', e.target.value)}
                                        onFocus={() => form.clearErrors('lastname')}
                                        autoComplete="family-name"
                                        placeholder="Ex: Kamga"
                                        className="h-11 rounded-xl border-border bg-background px-3.5 text-sm text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                    <InputError message={form.errors.lastname} />
                                </div>
                            </div>

                            {/* Téléphone WhatsApp avec sélecteur de pays */}
                            <div className="grid gap-1.5 text-left">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="phone" className="text-xs font-bold text-foreground">
                                        Téléphone / WhatsApp
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">Suivi des livraisons</span>
                                </div>

                                <div className="flex rounded-xl border border-border bg-background shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                    {/* Sélecteur de pays */}
                                    <div className="relative shrink-0">
                                        <select
                                            value={selectedCountryCode}
                                            onChange={(e) => setSelectedCountryCode(e.target.value)}
                                            className="h-11 w-[96px] sm:w-[124px] appearance-none rounded-l-xl border-r border-border bg-muted/40 pl-2.5 pr-6 text-xs font-bold text-foreground outline-none cursor-pointer hover:bg-muted/70 transition-colors truncate"
                                            aria-label="Sélectionner l'indicatif pays"
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

                                    {/* Champ numéro */}
                                    <Input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        inputMode="tel"
                                        autoComplete="tel-national"
                                        placeholder="6xx xxx xxx"
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        onFocus={() => form.clearErrors('phone')}
                                        className="h-11 flex-1 rounded-l-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                                    />
                                </div>
                                <InputError message={form.errors.phone} />
                            </div>

                            {/* Avantages visuels miniatures */}
                            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/30 p-2.5 border border-border/60 text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span>Tournées express 24h</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <span>Tarifs de gros & B2B</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleNextStep}
                                className="mt-1 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-[1.01] active:scale-98"
                            >
                                <span>Continuer vers la sécurité</span>
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}

                    {/* ---------- ÉTAPE 2 : IDENTIFIANTS & MOT DE PASSE ---------- */}
                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="grid gap-4"
                        >
                            {/* Adresse e-mail */}
                            <div className="grid gap-1.5 text-left">
                                <Label htmlFor="email" className="text-xs font-bold text-foreground">
                                    Adresse e-mail <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative flex items-center">
                                    <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoFocus
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        onFocus={() => form.clearErrors('email')}
                                        autoComplete="email"
                                        placeholder="votre.email@domaine.com"
                                        className="h-11 rounded-xl border-border bg-background pl-10 text-sm text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                </div>
                                <InputError message={form.errors.email} />
                            </div>

                            {/* Mot de passe */}
                            <div className="grid gap-1.5 text-left">
                                <Label htmlFor="password" className="text-xs font-bold text-foreground">
                                    Mot de passe <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative flex items-center">
                                    <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        onFocus={() => form.clearErrors('password')}
                                        autoComplete="new-password"
                                        placeholder="Au moins 8 caractères"
                                        className="h-11 rounded-xl border-border bg-background pl-10 pr-10 text-sm text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={form.errors.password} />
                            </div>

                            {/* Confirmation du mot de passe */}
                            <div className="grid gap-1.5 text-left">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password_confirmation" className="text-xs font-bold text-foreground">
                                        Confirmer le mot de passe <span className="text-destructive">*</span>
                                    </Label>
                                    {passwordsMatch !== null && (
                                        <span className={`text-[10px] font-semibold flex items-center gap-1 ${passwordsMatch ? 'text-emerald-600' : 'text-destructive'}`}>
                                            {passwordsMatch ? (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Correspond
                                                </>
                                            ) : (
                                                'Ne correspond pas'
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div className="relative flex items-center">
                                    <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={showConfPassword ? 'text' : 'password'}
                                        value={form.data.password_confirmation}
                                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                        onFocus={() => form.clearErrors('password_confirmation')}
                                        autoComplete="new-password"
                                        placeholder="Répétez le mot de passe"
                                        className="h-11 rounded-xl border-border bg-background pl-10 pr-10 text-sm text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfPassword((v) => !v)}
                                        aria-label={showConfPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                                    >
                                        {showConfPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={form.errors.password_confirmation} />
                            </div>

                            {/* Boutons Retour & Soumission */}
                            <div className="mt-2 flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevStep}
                                    className="h-11 w-1/3 rounded-xl border-border font-medium text-foreground hover:bg-accent"
                                >
                                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                                    <span>Retour</span>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="h-11 w-2/3 rounded-xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-[1.01] active:scale-98"
                                >
                                    {form.processing ? (
                                        <div className="flex items-center gap-2">
                                            <Spinner className="h-4 w-4" />
                                            <span>Création...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <span>Créer mon compte</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Lien de redirection Connexion --- */}
                <div className="mt-2 text-center text-xs sm:text-sm text-muted-foreground">
                    Vous possédez déjà un compte ?{' '}
                    <TextLink href={login()} className="font-bold text-primary hover:underline">
                        Connectez-vous
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
