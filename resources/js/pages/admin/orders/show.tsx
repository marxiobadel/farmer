import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import { BreadcrumbItem, Order } from "@/types";
import { Head } from "@inertiajs/react";

interface PageProps {
    order: Order;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des commandes", href: admin.orders.index().url },
    { title: "Détails de commande", href: '#' },
];

export default function Show({ order }: PageProps) {
    const isMobile = useIsMobile();
    console.log(order);

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Détails de commande" />
            <div className="p-4 sm:p-6 lg:p-8">

            </div>
        </AppLayout>
    );
}
