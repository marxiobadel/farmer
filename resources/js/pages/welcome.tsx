// Components
import AuthLayout from '@/layouts/auth-layout';
import { login, register } from '@/routes';
import { Head, Link } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthLayout
            title="Bienvenue"
            description="Veuillez choisir une option pour continuer"
        >
            <Head title="Bienvenue" />

            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
                <Link
                    href={login()}
                    className="
                        w-56 px-6 py-3 text-center font-semibold
                        rounded-2xl
                        bg-gradient-to-r from-blue-600 to-blue-500
                        text-white
                        shadow-sm shadow-blue-300/30
                        hover:shadow-blue-400/40
                        hover:scale-[1.02]
                        active:scale-[0.98]
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-300/70
                    "
                >
                    Connexion
                </Link>

                <Link
                    href={register()}
                    className="
                        w-56 px-6 py-3 text-center font-semibold
                        rounded-2xl
                        bg-gradient-to-r from-green-600 to-green-500
                        text-white
                        shadow-sm shadow-green-300/30
                        hover:shadow-green-400/40
                        hover:scale-[1.02]
                        active:scale-[0.98]
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-green-300/70
                    "
                >
                    Créer un compte
                </Link>
            </div>
        </AuthLayout>
    );
}
