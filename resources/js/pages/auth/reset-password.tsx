import { update } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { buttonClassNames, inputClassNames } from '@/lib/utils';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfPassword, setShowConfPassword] = useState(false);

    return (
        <AuthLayout
            title="Réinitialiser le mot de passe"
            description="Veuillez saisir votre nouveau mot de passe ci-dessous"
        >
            <Head title="Réinitialiser le mot de passe" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                options={{
                    preserveScroll: 'errors'
                }}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className={inputClassNames('block w-full bg-white border-1 shadow-none')}
                                readOnly
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete="new-password"
                                    className={inputClassNames('block w-full bg-white border-1 shadow-none')}
                                    autoFocus
                                    placeholder="Mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    className="absolute right-[10px] top-1/2 -translate-y-1/2 z-10"
                                >
                                    {showPassword ? <Eye className="text-global-6" size={20} /> : <EyeOff className="text-global-6" size={20} />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirmer le mot de passe
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    className={inputClassNames('block w-full bg-white border-1 shadow-none')}
                                    placeholder="Confirmer le mot de passe"
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
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button
                            type="submit"
                            className={buttonClassNames('mt-3 w-full')}
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            Réinitialiser le mot de passe
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
