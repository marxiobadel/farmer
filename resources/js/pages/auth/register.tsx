import { useState } from 'react';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { buttonClassNames, inputClassNames, playToastSound } from '@/lib/utils';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [step, setStep] = useState(1);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);

    const form = useForm({
        lastname: '',
        firstname: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();

        form.post(store.form().action, {
            preserveState: true,
            preserveScroll: 'errors',
            onError: () => {
                toast('Erreur !', {
                    description: "Une erreur est survenue lors de l'inscription. Veuillez vérifier vos informations et réessayer.",
                    className: "border border-amber-500 bg-white text-black shadow-lg",
                    icon: "🔔",
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
            title="Créer un compte"
            description="Entrez vos informations pour créer votre compte"
        >
            <Head title="S'inscrire" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* --- Step indicator --- */}
                <div className="flex justify-center mb-2 text-sm font-medium text-muted-foreground">
                    Étape {step} sur 2
                </div>

                {/* ---------- STEP 1 --------- */}
                {step === 1 && (
                    <div className="grid gap-6 animate-in fade-in-0 zoom-in-95">
                        <div className="grid gap-2">
                            <Label htmlFor="lastname">Nom de famille</Label>
                            <Input
                                id="lastname"
                                name="lastname"
                                value={form.data.lastname}
                                onChange={e => form.setData('lastname', e.target.value)}
                                onFocus={() => form.clearErrors('lastname')}
                                autoComplete="family-name"
                                placeholder="Votre nom"
                                className={inputClassNames('bg-white border-1 shadow-none')}
                            />
                            <InputError message={form.errors.lastname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="firstname">Prénom</Label>
                            <Input
                                id="firstname"
                                name="firstname"
                                value={form.data.firstname}
                                onChange={e => form.setData('firstname', e.target.value)}
                                onFocus={() => form.clearErrors('firstname')}
                                autoComplete="given-name"
                                placeholder="Votre prénom"
                                className={inputClassNames('bg-white border-1 shadow-none')}
                            />
                            <InputError message={form.errors.firstname} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={form.data.phone}
                                onChange={e => form.setData('phone', e.target.value)}
                                onFocus={() => form.clearErrors('phone')}
                                autoComplete="tel"
                                placeholder="Téléphone"
                                className={inputClassNames('bg-white border-1 shadow-none')}
                            />
                            <InputError message={form.errors.phone} />
                        </div>

                        <Button
                            type="button"
                            onClick={() => setStep(2)}
                            className={buttonClassNames('mt-3 w-full')}
                        >
                            Continuer
                        </Button>
                    </div>
                )}

                {/* ---------- STEP 2 --------- */}
                {step === 2 && (
                    <div className="grid gap-6 animate-in fade-in-0 zoom-in-95">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={form.data.email}
                                onChange={e => form.setData('email', e.target.value)}
                                onFocus={() => form.clearErrors('email')}
                                autoComplete="email"
                                placeholder="email@example.com"
                                className={inputClassNames('bg-white border-1 shadow-none')}
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.data.password}
                                    onChange={e => form.setData('password', e.target.value)}
                                    onFocus={() => form.clearErrors('password')}
                                    autoComplete="new-password"
                                    placeholder="Mot de passe"
                                    className={inputClassNames('bg-white border-1 shadow-none')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-[10px] top-1/2 -translate-y-1/2"
                                >
                                    {showPassword
                                        ? <Eye className="text-global-6" size={20} />
                                        : <EyeOff className="text-global-6" size={20} />}
                                </button>
                            </div>
                            <InputError message={form.errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfPassword ? "text" : "password"}
                                    value={form.data.password_confirmation}
                                    onChange={e => form.setData('password_confirmation', e.target.value)}
                                    onFocus={() => form.clearErrors('password_confirmation')}
                                    autoComplete="new-password"
                                    placeholder="Confirmer le mot de passe"
                                    className={inputClassNames('bg-white border-1 shadow-none')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfPassword(v => !v)}
                                    className="absolute right-[10px] top-1/2 -translate-y-1/2"
                                >
                                    {showConfPassword
                                        ? <Eye className="text-global-6" size={20} />
                                        : <EyeOff className="text-global-6" size={20} />}
                                </button>
                            </div>
                            <InputError message={form.errors.password_confirmation} />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-1/3"
                                onClick={() => setStep(1)}
                            >
                                Retour
                            </Button>

                            <Button
                                type="submit"
                                className={buttonClassNames('w-2/3')}
                                disabled={form.processing}
                            >
                                {form.processing && <Spinner />}
                                Créer un compte
                            </Button>
                        </div>
                    </div>
                )}

                {/* --- Footer link --- */}
                <div className="text-center text-sm text-muted-foreground mt-4">
                    Vous avez déjà un compte ?{' '}
                    <TextLink href={login()}>Connexion</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
