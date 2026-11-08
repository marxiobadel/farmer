import { Head, useForm, usePage } from '@inertiajs/react';
import type { BreadcrumbItem, Coupon, SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import admin from '@/routes/admin';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCurrencyFormatter } from '@/hooks/use-currency';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Produits',
        href: admin.settings.page({ page: 'products' }).url,
    },
];

interface ProductsProps {
    coupons: Coupon[];
}

interface ProductSettingsForm {
    show_price: boolean;
    promo_coupon_id: number | null;
}

export default function Products({ coupons = [] }: ProductsProps) {
    const formatCurrency = useCurrencyFormatter();
    const props = usePage<SharedData>().props;
    const settings = props.settings;

    const { data, setData, post, processing, reset, errors } = useForm<ProductSettingsForm>({
        show_price: Boolean(settings?.show_price),
        promo_coupon_id: settings?.promo_coupon?.id ?? null,
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
        return () => reset();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produits" />
            <SettingsLayout>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                    {/* Section 1: Visibilité des prix */}
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6 border-b border-gray-100">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg">
                                Afficher le prix des produits
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Gérez les informations visibles par les clients sur les cartes produit dans la boutique.
                            </p>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-6 px-0 py-2">
                                <div className="flex flex-col items-start gap-1 flex-1">
                                    <h3 className="font-semibold text-gray-900 text-sm">
                                        Afficher le prix
                                    </h3>
                                    <p className="text-gray-500 text-xs">
                                        Lorsque désactivé, le prix ne sera pas affiché sur les cartes produit.
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <Switch
                                        checked={data.show_price}
                                        onCheckedChange={(checked) => setData('show_price', checked)}
                                    />
                                </div>
                            </div>
                            {errors.show_price && (
                                <p className="text-xs text-red-500">{errors.show_price}</p>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Coupon promotionnel en vedette */}
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg">
                                Bannière promotionnelle
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Choisissez un coupon actif à mettre en avant ou à appliquer automatiquement lors du parcours d'achat.
                            </p>
                        </div>
                        <div className="flex-1 flex flex-col gap-3 max-w-md">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="promo_coupon"
                                    className="font-semibold text-gray-900 text-sm"
                                >
                                    Coupon promotionnel
                                </label>
                                <p className="text-gray-500 text-xs mb-1">
                                    Sélectionnez le code promo associé aux campagnes produit.
                                </p>

                                <Select
                                    value={data.promo_coupon_id !== null ? String(data.promo_coupon_id) : 'none'}
                                    onValueChange={(value) =>
                                        setData('promo_coupon_id', value === 'none' ? null : Number(value))
                                    }
                                >
                                    <SelectTrigger id="promo_coupon" className="w-full">
                                        <SelectValue placeholder="Sélectionner un coupon..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-muted-foreground italic">
                                                Aucun coupon actif
                                            </span>
                                        </SelectItem>
                                        {coupons.map((coupon) => (
                                            <SelectItem key={coupon.id} value={String(coupon.id)}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{coupon.code}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({coupon.type === 'percent' ? `-${coupon.value}%` : `-${formatCurrency(coupon.value)}`}
                                                        {coupon.min_order_amount > 0 && ` dès ${formatCurrency(coupon.min_order_amount)}`})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {errors.promo_coupon_id && (
                                <p className="text-xs text-red-500">{errors.promo_coupon_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions de validation */}
                    <div className="flex justify-end p-6 border-t border-gray-100 mt-auto">
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
