import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres d'apparence" />

            <SettingsLayout>
                <div className="flex flex-col flex-1">
                    {/* Informations personnelles */}
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                                Paramètres d'apparence
                            </h2>
                            <p className="text-gray-500 text-sm dark:text-gray-400">
                                Mettez à jour les paramètres d'apparence de votre compte.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <AppearanceTabs />
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
