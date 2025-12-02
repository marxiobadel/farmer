import { Head } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import Can from '@/components/can';
import AdminGeneralForm from './admin-general-form';
import admin from '@/routes/admin';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres générales',
        href: admin.settings.page({ page: 'general' }).url,
    },
];

export default function General() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres générales" />
            <SettingsLayout>
                <Can role="superadmin">
                    <AdminGeneralForm />
                </Can>
            </SettingsLayout>
        </AppLayout>
    );
}
