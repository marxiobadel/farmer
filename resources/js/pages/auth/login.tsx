import { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff, CheckCircle2, Lock, Mail, ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    return (
        <AuthLayout
            title="Bienvenue à nouveau"
            description="Accédez à votre espace client pour suivre vos commandes et gérer vos livraisons."
        >
            <Head title="Connexion sécurisée" />

            {/* Notification de Statut (ex: mot de passe réinitialisé) */}
            {status && (
                <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                options={{
                    preserveScroll: 'errors',
                }}
                className="flex flex-col gap-5"
            >
                {({ processing, errors, clearErrors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Champ Adresse E-mail */}
                            <div className="grid gap-1.5 text-left">
                                <Label htmlFor="email" className="text-xs font-bold text-foreground">
                                    Adresse e-mail
                                </Label>
                                <div className="relative flex items-center">
                                    <Mail className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoFocus
                                        tabIndex={1}
                                        onFocus={() => clearErrors('email')}
                                        autoComplete="email"
                                        placeholder="nom@entreprise.com"
                                        className="h-11 rounded-xl border-border bg-background pl-10 text-sm text-foreground shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Champ Mot de Passe */}
                            <div className="grid gap-1.5 text-left">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-bold text-foreground">
                                        Mot de passe
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-primary hover:underline"
                                            tabIndex={5}
                                        >
                                            Mot de passe oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative flex items-center">
                                    <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        onFocus={() => clearErrors('password')}
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••••••"
                                        className="h-11 rounded-xl border-border bg-background pl-10 pr-10 text-sm text-foreground shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                        className="absolute right-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Option Se souvenir de moi */}
                            <div className="flex items-center space-x-2.5 pt-0.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label htmlFor="remember" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                                    Se souvenir de moi pendant 30 jours
                                </Label>
                            </div>

                            {/* Bouton de Soumission */}
                            <Button
                                type="submit"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                className="mt-2 h-11 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-95 hover:scale-[1.01] active:scale-98"
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <Spinner className="h-4 w-4" />
                                        <span>Connexion en cours...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Se connecter</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                )}
                            </Button>
                        </div>

                        {/* Lien d'inscription (avec correction typo) */}
                        {canRegister && (
                            <div className="mt-1 text-center text-xs sm:text-sm text-muted-foreground">
                                Vous n'avez pas encore de compte ?{' '}
                                <TextLink href={register()} tabIndex={6} className="font-bold text-primary hover:underline">
                                    Inscrivez-vous
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
