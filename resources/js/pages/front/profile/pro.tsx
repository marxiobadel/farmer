import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Address, Cart, Product, Zone } from "@/types";
import ProfileLayout from "@/layouts/profile/layout";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { useForm } from "react-hook-form";

interface PageProps {
    hasProSpace: boolean;
    products: Product[];
    cart: Cart;
    zones: Zone[];
    addresses: Address[];
}
export default function Index({ hasProSpace, products, cart, zones, addresses }: PageProps) {
    const formatCurrency = useCurrencyFormatter();

    const form = useForm({
        defaultValues: {
            shipping_address_id: null as string | null,
            billing_address_id: null as string | null,
            zone_id: null as number | null,
            carrier_id: null as string | null,
            method: "cash",
            current_product_id: null as number | null,
        }
    });

    const { control, handleSubmit, watch, setValue, formState: { errors } } = form;
    const selectedZoneId = watch("zone_id");
    const selectedZone = zones.find((z) => z.id === selectedZoneId);

    const selectedCarrierId = watch("carrier_id");

    return (
        <AppLayout layout="guest">
            <Head title="Espace Pro" />
            <ProfileLayout>

            </ProfileLayout>
        </AppLayout>
    );
}
