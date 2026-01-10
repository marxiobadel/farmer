import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Order, SharedData } from "@/types";
import ProfileLayout from "@/layouts/profile/layout";

interface ShowProps {
    order: Order;
}

export default function Show({ order }: ShowProps) {
    const { auth } = usePage<SharedData>().props;
    const formatCurrency = useCurrencyFormatter();

    return (
        <AppLayout layout="guest">
            <Head title={`Commande #${order.id}`} />
            <ProfileLayout>
                {/* Contenu de la page de détail de la commande */}
            </ProfileLayout>
        </AppLayout>
    );
}
