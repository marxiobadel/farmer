import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type SharedData, type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn, inputClassNames } from '@/lib/utils';
import admin from '@/routes/admin';
import verification from '@/routes/verification';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mon compte',
        href: admin.settings.page({ page: 'account' }).url,
    },
];

export default function Account({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const { lastname, firstname, email, phone, avatar_url } = auth.user;

    const { data, setData, post, processing, errors, progress } = useForm({
        lastname,
        firstname,
        email,
        phone,
        image: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(avatar_url ?? null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(admin.settings.update({ page: 'account' }).url, {
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground dark:text-gray-900">
                            Succès !
                        </span>
                        <span className="text-sm text-muted-foreground dark:text-gray-500">
                            Compte correctement mis à jour.
                        </span>
                    </div>
                );
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon compte" />
            <SettingsLayout>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                    {/* Informations personnelles */}
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                                Paramètre du compte
                            </h2>
                            <p className="text-gray-500 text-sm dark:text-gray-400">
                                Affichez et mettez à jour les détails de votre compte, votre profil et bien plus encore.
                            </p>
                        </div>

                        <div className="flex-1 flex flex-col gap-4">
                            <div>
                                <label htmlFor="lastname" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Nom de famille
                                </label>
                                <Input
                                    id="lastname"
                                    type="text"
                                    value={data.lastname}
                                    onChange={(e) => setData('lastname', e.target.value)}
                                    className={cn('mt-1', inputClassNames())}
                                />
                                {errors.lastname && (
                                    <p className="text-sm text-red-500 mt-1">{errors.lastname}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="firstname" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Prénom
                                </label>
                                <Input
                                    id="firstname"
                                    type="text"
                                    required
                                    value={data.firstname}
                                    onChange={(e) => setData('firstname', e.target.value)}
                                    className={cn('mt-1', inputClassNames())}
                                />
                                {errors.firstname && (
                                    <p className="text-sm text-red-500 mt-1">{errors.firstname}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    E-mail
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={cn('mt-1', inputClassNames())}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                )}
                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Votre adresse e-mail n'est pas vérifiée.{' '}
                                            <Link
                                                href={verification.send().url}
                                                method="post"
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!"
                                            >
                                                Cliquez ici pour renvoyer l'e-mail de vérification.
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-1 text-sm font-medium text-green-600">
                                                Un nouveau lien de vérification a été envoyé à votre adresse e-mail.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="phone" className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Téléphone (facultatif)
                                </label>
                                <Input
                                    id="phone"
                                    type="text"
                                    value={data.phone ?? ''}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={cn('mt-1', inputClassNames())}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Image de profil */}
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6 border-t border-gray-100">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                                Image de profil
                            </h2>
                            <p className="text-gray-500 text-sm dark:text-gray-400">
                                Cette image permettra de mieux vous identifier.
                            </p>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24">
                                    <div className="rounded-full overflow-hidden border border-gray-200 bg-gray-50 w-full h-full flex items-center justify-center dark:bg-neutral-800">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="Aperçu de l'image"
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>

                                    {preview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            aria-label="Supprimer l'image"
                                            className="absolute -top-2 -right-2 z-10 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-gray-100 transition"
                                        >
                                            <X className="w-3 h-3 text-gray-600" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label
                                        htmlFor="image"
                                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Changer la photo
                                    </label>
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    {progress ? (
                                        <div className="mt-2 w-full">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <LoaderCircle className="w-3 h-3 animate-spin text-primary" />
                                                    <span>Téléchargement…</span>
                                                </div>
                                                <span>{progress.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-2 bg-primary rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${progress.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) :
                                        (<p className="text-xs text-gray-500 mt-1">
                                            PNG ou JPG. Max 2 Mo.
                                        </p>)}
                                    {errors.image && (
                                        <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bouton de sauvegarde */}
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
