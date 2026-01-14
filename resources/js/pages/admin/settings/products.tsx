import { Head, useForm, usePage } from '@inertiajs/react';
import type { BreadcrumbItem, SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import admin from '@/routes/admin';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produits',
        href: admin.settings.page({ page: 'products' }).url,
    },
];

export default function Products() {
    const props = usePage<SharedData>().props;
    const settings = props.settings;

    const { data, setData, post, processing, reset } = useForm({
        show_price: !!settings.show_price,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.settings.update({ page: 'products' }).url, {
            onSuccess: () => {
                toast.success(
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground dark:text-gray-900">
                            Succès !
                        </span>

                        <span className="text-sm text-muted-foreground dark:text-gray-500">
                            Paramètres administratifs de produits mis à jour avec succès.
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produits" />
            <SettingsLayout>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg">
                                Afficher le prix des produits
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Gérez les informations visibles par les clients sur les cartes produit dans la boutique.
                            </p>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center gap-6 px-0 py-4 relative">
                                <div className="flex flex-col items-start gap-1 relative flex-1 grow">
                                    <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Inter_Tight-SemiBold',Helvetica] font-semibold text-gray-900 text-sm tracking-[0.28px] leading-[21px]">
                                        Afficher le prix
                                    </h2>
                                    <p className="relative self-stretch [font-family:'Inter_Tight-Medium',Helvetica] font-medium text-gray-500 text-xs tracking-[0.24px] leading-[18px]">
                                        Lorsque désactivé, le prix ne sera pas affiché sur les cartes produit.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={data.show_price}
                                        onCheckedChange={(checked) => setData("show_price", checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end p-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            aria-label="Sauvegarder"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center justify-center">
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                <span className="whitespace-nowrap">Sauvegarder</span>
                            </div>
                        </button>
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
