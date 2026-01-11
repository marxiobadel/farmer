import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ProfileLayout from "@/layouts/profile/layout";

export default function Addresses() {

    return (
        <AppLayout layout="guest">
            <Head title="Modifier mon mot de passe" />
            <ProfileLayout>

            </ProfileLayout>
        </AppLayout>
    );
}
