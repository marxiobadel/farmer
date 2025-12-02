import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn, inputClassNames } from '@/lib/utils';
import admin from '@/routes/admin';
import userPassword from '@/routes/user-password';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mot de passe',
        href: admin.settings.page({ page: 'password' }).url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurPassword, setShowCurPassword] = useState(false);

    const toggleCurPasswordVisibility = () => {
        setShowCurPassword(prev => !prev);
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const [showConfPassword, setShowConfPassword] = useState(false);

    const toggleConfPasswordVisibility = () => {
        setShowConfPassword(prev => !prev);
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(userPassword.update().url, {
            preserveScroll: 'errors',
            onSuccess: () => {
                reset(),
                    toast.success(
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground dark:text-gray-900">Succès !</span>
                            <span className="text-sm text-muted-foreground dark:text-gray-500">
                                Mot de passe correctement mis à jour.
                            </span>
                        </div>);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mot de passe" />

            <SettingsLayout>
                <form onSubmit={updatePassword} className="flex flex-col flex-1">
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                                Mot de passe
                            </h2>
                            <p className="text-gray-500 text-sm dark:text-gray-400">
                                Modifier ou afficher votre mot de passe.
                            </p>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                            <div>
                                <label htmlFor="current_password" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Mot de passe actuel
                                </label>
                                <div className="relative">
                                    <Input
                                        ref={currentPasswordInput}
                                        id="current_password"
                                        type={showCurPassword ? "text" : "password"}
                                        value={data.current_password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('current_password', e.target.value)}
                                        className={cn('mt-1', inputClassNames())}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleCurPasswordVisibility}
                                        aria-label={showCurPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                        className="absolute right-[10px] top-1/2 -translate-y-1/2 z-10"
                                    >
                                        {showCurPassword ? <Eye className="text-global-6" size={20} /> : <EyeOff className="text-global-6" size={20} />}
                                    </button>
                                </div>
                                {errors.current_password && (
                                    <p className="text-sm text-red-500 mt-1">{errors.current_password}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="password" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <Input
                                        ref={passwordInput}
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={data.password}
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={cn('mt-1', inputClassNames())}
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
                                {errors.password && (
                                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="password_confirmation" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Confirmation
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfPassword ? "text" : "password"}
                                        value={data.password_confirmation}
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={cn('mt-1', inputClassNames())}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfPasswordVisibility}
                                        aria-label={showConfPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                        className="absolute right-[10px] top-1/2 -translate-y-1/2 z-10"
                                    >
                                        {showConfPassword ? <Eye className="text-global-6" size={20} /> : <EyeOff className="text-global-6" size={20} />}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end p-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            aria-label="Sauvegarder"
                            className={cn(
                                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition-colors",

                                // Light mode
                                "bg-primary text-white hover:bg-primary/90",

                                // Dark mode
                                "dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80",

                                // Focus + disabled
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center justify-center">
                                {processing && (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <span className="whitespace-nowrap">Sauvegarder</span>
                            </div>
                        </button>
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
