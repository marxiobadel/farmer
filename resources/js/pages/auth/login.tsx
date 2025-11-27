import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { buttonClassNames, inputClassNames } from '@/lib/utils';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

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

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    return (
        <AuthLayout
            title="Connectez-vous à votre compte"
            description="Entrez votre e-mail et votre mot de passe ci-dessous pour vous connecter"
        >
            <Head title="Connexion" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                options={{
                    preserveScroll: 'errors'
                }}
                className="flex flex-col gap-6"
            >
                {({ processing, errors, clearErrors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Adresse e-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoFocus
                                    tabIndex={1}
                                    onFocus={() => clearErrors('email')}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className={inputClassNames('bg-white border-1 shadow-none')}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Mot de passe oublié ?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        onFocus={() => clearErrors('password')}
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Mot de passe"
                                        className={inputClassNames('bg-white border-1 shadow-none')}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                        className="absolute right-[10px] top-1/2 -translate-y-1/2 z-10"
                                    >
                                        {showPassword ? <Eye className="text-global-6" size={20} /> : <EyeOff className="text-global-6" size={20} />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className={inputClassNames('bg-white border-1 shadow-none')}
                                />
                                <Label htmlFor="remember">Se souvenir de moi</Label>
                            </div>

                            <Button
                                type="submit"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                className={buttonClassNames('mt-3 w-full')}
                            >
                                {processing && <Spinner />}
                                Connexion
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Vous n'avez pas de compte ?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Incrivez-vous
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
