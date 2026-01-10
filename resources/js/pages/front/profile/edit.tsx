import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import ProfileLayout from "@/layouts/profile/layout";

export default function Edit() {
    return (
        <AppLayout layout="guest">
            <Head title="Modifier mon profil" />
            <ProfileLayout>

            </ProfileLayout>
        </AppLayout>
    );
}
