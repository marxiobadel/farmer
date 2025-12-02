import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import admin from '@/routes/admin';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { disable, enable } from '@/routes/two-factor';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Authentification à deux facteurs',
        href: admin.settings.page({ page: 'two-factor' }).url,
    },
];

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function TwoFactor({ requiresConfirmation = false, twoFactorEnabled = false }: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Authentification à deux facteurs" />

            <SettingsLayout>
                <div className="flex flex-col flex-1">
                    <div className="flex flex-col lg:flex-row items-start gap-6 p-6">
                        <div className="w-full lg:w-[300px] mb-4 lg:mb-0">
                            <h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
                                Authentification à deux facteurs
                            </h2>
                            <p className="text-gray-500 text-sm dark:text-gray-400">
                                Gérez vos paramètres d'authentification à deux facteurs.
                            </p>
                        </div>
                        <div className="flex-1 flex flex-col gap-4">
                            {twoFactorEnabled ? (
                                <div className="flex flex-col items-start justify-start space-y-4">
                                    <Badge variant="default">Activée</Badge>
                                    <p className="text-muted-foreground text-md">
                                        Lorsque l'authentification à deux facteurs est
                                        activée, un code sécurisé et aléatoire vous sera
                                        demandé lors de la connexion. Vous pourrez le
                                        récupérer depuis une application compatible
                                        TOTP installée sur votre téléphone.
                                    </p>

                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />

                                    <div className="relative inline">
                                        <Form {...disable.form()}>
                                            {({ processing }) => (
                                                <Button
                                                    variant="destructive"
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    <ShieldBan /> Désactiver la 2FA
                                                </Button>
                                            )}
                                        </Form>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-start justify-start space-y-4">
                                    <Badge variant="destructive">Désactivée</Badge>
                                    <p className="text-muted-foreground text-md">
                                        Lorsque vous activez l'authentification à deux
                                        facteurs, un code sécurisé vous sera demandé
                                        lors de la connexion. Ce code peut être obtenu
                                        via une application compatible TOTP sur votre
                                        téléphone.
                                    </p>

                                    <div>
                                        {hasSetupData ? (
                                            <Button
                                                onClick={() => setShowSetupModal(true)}
                                            >
                                                <ShieldCheck />
                                                Continuer la configuration
                                            </Button>
                                        ) : (
                                            <Form
                                                {...enable.form()}
                                                onSuccess={() =>
                                                    setShowSetupModal(true)
                                                }
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        <ShieldCheck />
                                                        Activer la 2FA
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </div>
                            )}

                            <TwoFactorSetupModal
                                isOpen={showSetupModal}
                                onClose={() => setShowSetupModal(false)}
                                requiresConfirmation={requiresConfirmation}
                                twoFactorEnabled={twoFactorEnabled}
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                clearSetupData={clearSetupData}
                                fetchSetupData={fetchSetupData}
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
