import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export function useCurrencyFormatter(locale: string = 'fr') {
    const { defaultCurrency } = usePage<SharedData>().props;

    return (amount: number, currency: string = defaultCurrency) =>
        new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(amount);
}