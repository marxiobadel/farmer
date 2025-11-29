import { Head, useForm as useInertiaForm } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BreadcrumbItem, User } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { useEventBus } from "@/context/event-bus-context";
import { userRoles } from "@/data";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { UserInput } from "./create";
import { dashboard } from "@/routes";
import { index, update } from "@/routes/users";

// ----------- Types -------------

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des utilisateurs", href: index().url },
    { title: "Modifier un utilisateur", href: '#' },
];

interface EditProps {
    user: User;
}

export default function Edit({ user }: EditProps) {
    const { emit } = useEventBus();
    const isMobile = useIsMobile();

    const initialInputs: UserInput = {
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        address: user.address || '',
        role_name: user.roles[0] || '',
        is_active: user.is_active || true,
        email: user.email || '',
    };

    const form = useForm<UserInput>({ defaultValues: { ...initialInputs } });

    const { control, handleSubmit } = form;

    const {
        put,
        processing,
        errors,
        setData,
        clearErrors,
    } = useInertiaForm<UserInput>({ ...initialInputs });

    const onSubmit = () => {
        put(update(user.id).url, {
            preserveState: true,
            preserveScroll: 'errors',
            onSuccess: () => emit('user.saved', `Utilisateur correctement modifié !`, { persist: true }),
            onError: (errors) => {
                if (errors.error) {
                    toast.error('Erreur !', { description: errors.error });
                } else {
                    toast.error('Erreur !', { description: `Une erreur est survenue, vérifiez le formulaire.` });
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Modifier un utilisateur" />
            <div className="p-4 sm:p-6 lg:p-8 ">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modifier un utilisateur
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Revoir les informations générales suivantes
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid grid-cols-1 lg:grid-cols-4 md:space-x-4 space-y-4"
                    >
                        <div className="md:col-span-2 lg:col-span-3 space-y-4">
                            <Card className="p-4 space-y-0 shadow-none">
                                <h2 className="text-xl font-semibold mb-2">
                                    Informations générales
                                </h2>
                                <div className="grid md:grid-cols-2 gap-x-4 gap-y-4">
                                    <FormFieldWrapper
                                        control={control}
                                        name="firstname"
                                        label="Prénom"
                                        placeholder="Votre prénom"
                                        onValueChange={(value) => setData("firstname", value)}
                                        onFocus={() => clearErrors('firstname')}
                                        error={errors.firstname}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="lastname"
                                        label="Nom"
                                        placeholder="Votre nom"
                                        onValueChange={(value) => setData("lastname", value)}
                                        onFocus={() => clearErrors('lastname')}
                                        error={errors.lastname}
                                    />
                                </div>
                                <FormFieldWrapper
                                    control={control}
                                    name="address"
                                    label="Adresse"
                                    placeholder="Rue Wiertz 60, B-1047 Bruxelles, Belgique"
                                    onValueChange={(value) => setData("address", value)}
                                    onFocus={() => clearErrors('address')}
                                    error={errors.address}
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormFieldWrapper
                                        control={control}
                                        name="phone"
                                        label="Téléphone"
                                        placeholder="+237..."
                                        onValueChange={(value) => setData("phone", value)}
                                        onFocus={() => clearErrors('phone')}
                                        error={errors.phone}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="email"
                                        label="E-mail"
                                        placeholder="exemple@mail.com"
                                        onValueChange={(value) => setData("email", value)}
                                        onFocus={() => clearErrors('email')}
                                        error={errors.email}
                                    />
                                </div>
                            </Card>
                        </div>
                        <div className="md:col-span-2 lg:col-span-1">
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-2">
                                    Annexe
                                </h2>
                                <FormFieldWrapper
                                    control={control}
                                    name="role_name"
                                    label="Rôle"
                                    type="select"
                                    placeholder="Choisir le rôle"
                                    options={userRoles}
                                    onOpenChange={() => clearErrors('role_name')}
                                    onValueChange={(value) => setData("role_name", value)}
                                    error={errors.role_name}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name={`is_active`}
                                    label="Statut actif"
                                    type="switch"
                                    onCheckedChange={(checked) => setData("is_active", !!checked)}
                                />
                            </Card>
                        </div>
                        <Button type="submit" disabled={processing} className="mt-6 w-full">
                            {processing ? "Mise à jour..." : "Modifier l'utilisateur"}
                        </Button>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
