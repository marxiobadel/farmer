import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Order, SharedData } from "@/types";
import ProfileLayout from "@/layouts/profile/layout";

export default function Index() {
    const { auth } = usePage<SharedData>().props;
    const formatCurrency = useCurrencyFormatter();

    return (
        <AppLayout layout="guest">
            <Head title="Mes commandes" />
            <ProfileLayout>

            </ProfileLayout>
        </AppLayout>
    );
}
