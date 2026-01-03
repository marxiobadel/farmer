import { useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { cn, inputClassNames } from '@/lib/utils';
import { SharedData } from '@/types';
import admin from '@/routes/admin';

export default function AdminGeneralForm() {
    const props = usePage<SharedData>().props;
    const settings = props.settings;

    const { data, setData, post, processing, errors, reset } = useForm({
        address: settings.address ?? '',
        email: settings.email ?? '',
        phone: settings.phone ?? '',
        facebook_url: settings.facebook_url ?? '',
        instagram_url: settings.instagram_url ?? '',
        linkedin_url: settings.linkedin_url ?? '',
        twitter_url: settings.twitter_url ?? '',
        youtube_url: settings.youtube_url ?? '',
        headoffice: settings.headoffice ?? '',
        budget: settings.budget ?? '',
        registration: settings.registration ?? '',
        taxpayer_number: settings.taxpayer_number ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.settings.update({ page: 'general' }).url, {
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground dark:text-gray-900">
                            Succès !
                        </span>

                        <span className="text-sm text-muted-foreground dark:text-gray-500">
                            Paramètres administratifs mis à jour avec succès.
                        </span>
                    </div>
                );
            },
        });
    };

    useEffect(() => {
        return () => reset(); // clean up when unmounting
    }, []);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* === Section 1 : Coordonnées de contact === */}
            <div className="flex flex-col lg:flex-row items-start gap-6 p-6 border-b border-gray-100">
                {/* Intro block */}
                <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                    <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">Coordonnées de contact</h2>
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                        Ces informations seront utilisées pour les communications officielles.
                    </p>
                </div>

                {/* Form block */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="text-sm font-medium text-gray-500 dark:text-gray-300">Adresse</label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-500 dark:text-gray-300">E-mail</label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="text-sm font-medium text-gray-500 dark:text-gray-300">Téléphone</label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-6 p-6 border-b border-gray-100">
                {/* Intro block */}
                <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                    <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">Légalité</h2>
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                        Ces informations seront affichées dans les mentions légales du site.
                    </p>
                </div>

                {/* Form block */}
                <div className="flex-1 flex flex-col gap-4">
                    <div>
                        <label htmlFor="headoffice" className="text-sm font-medium text-gray-500 dark:text-gray-300">Siège social</label>
                        <Input
                            id="headoffice"
                            value={data.headoffice}
                            onChange={(e) => setData('headoffice', e.target.value)}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.headoffice && <p className="text-sm text-red-500 mt-1">{errors.headoffice}</p>}
                    </div>

                    <div>
                        <label htmlFor="budget" className="text-sm font-medium text-gray-500 dark:text-gray-300">Le capital</label>
                        <Input
                            id="budget"
                            type="number"
                            value={data.budget}
                            onChange={(e) => setData('budget', e.target.value)}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.budget && <p className="text-sm text-red-500 mt-1">{errors.budget}</p>}
                    </div>

                    <div>
                        <label htmlFor="registration" className="text-sm font-medium text-gray-500 dark:text-gray-300">Immatriculation</label>
                        <Input
                            id="registration"
                            type="text"
                            value={data.registration}
                            onChange={(e) => setData('registration', e.target.value)}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.registration && <p className="text-sm text-red-500 mt-1">{errors.registration}</p>}
                    </div>
                    <div>
                        <label htmlFor="taxpayer_number" className="text-sm font-medium text-gray-500 dark:text-gray-300">Numéro de contribuable</label>
                        <Input
                            id="taxpayer_number"
                            type="text"
                            value={data.taxpayer_number}
                            onChange={(e) => setData('taxpayer_number', e.target.value)}
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.taxpayer_number && <p className="text-sm text-red-500 mt-1">{errors.taxpayer_number}</p>}
                    </div>
                </div>
            </div>

            {/* === Section 2 : Liens sociaux === */}
            <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                {/* Intro block */}
                <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                    <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">Liens sociaux</h2>
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                        Ajoutez les liens vers vos réseaux sociaux officiels.
                    </p>
                </div>

                {/* Form block */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Facebook */}
                    <div>
                        <label htmlFor="facebook_url" className="text-sm font-medium text-gray-500 dark:text-gray-300">Facebook</label>
                        <Input
                            id="facebook_url"
                            value={data.facebook_url}
                            onChange={(e) => setData('facebook_url', e.target.value)}
                            placeholder="https://facebook.com/..."
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.facebook_url && <p className="text-sm text-red-500 mt-1">{errors.facebook_url}</p>}
                    </div>

                    {/* Instagram */}
                    <div>
                        <label htmlFor="instagram_url" className="text-sm font-medium text-gray-500 dark:text-gray-300">Instagram</label>
                        <Input
                            id="instagram_url"
                            value={data.instagram_url}
                            onChange={(e) => setData('instagram_url', e.target.value)}
                            placeholder="https://instagram.com/..."
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.instagram_url && <p className="text-sm text-red-500 mt-1">{errors.instagram_url}</p>}
                    </div>

                    {/* LinkedIn */}
                    <div>
                        <label htmlFor="linkedin_url" className="text-sm font-medium text-gray-500 dark:text-gray-300">LinkedIn</label>
                        <Input
                            id="linkedin_url"
                            value={data.linkedin_url}
                            onChange={(e) => setData('linkedin_url', e.target.value)}
                            placeholder="https://linkedin.com/company/..."
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.linkedin_url && <p className="text-sm text-red-500 mt-1">{errors.linkedin_url}</p>}
                    </div>

                    {/* Twitter */}
                    <div>
                        <label htmlFor="twitter_url" className="text-sm font-medium text-gray-500 dark:text-gray-300">Twitter</label>
                        <Input
                            id="twitter_url"
                            value={data.twitter_url}
                            onChange={(e) => setData('twitter_url', e.target.value)}
                            placeholder="https://twitter.com/..."
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.twitter_url && <p className="text-sm text-red-500 mt-1">{errors.twitter_url}</p>}
                    </div>

                    {/* YouTube */}
                    <div>
                        <label htmlFor="youtube_url" className="text-sm font-medium text-gray-500 dark:text-gray-300">YouTube</label>
                        <Input
                            id="youtube_url"
                            value={data.youtube_url}
                            onChange={(e) => setData('youtube_url', e.target.value)}
                            placeholder="https://youtube.com/..."
                            className={cn("mt-1", inputClassNames())}
                        />
                        {errors.youtube_url && <p className="text-sm text-red-500 mt-1">{errors.youtube_url}</p>}
                    </div>
                </div>
            </div>

            {/* === Submit === */}
            <div className="flex justify-end p-6 border-t border-gray-100 dark:border-neutral-600">
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
    );
}
