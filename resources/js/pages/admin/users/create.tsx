import { Head, useForm as useInertiaForm } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { useEventBus } from "@/context/event-bus-context";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { dashboard } from "@/routes";
import { userRoles } from "@/data";
import admin from "@/routes/admin";

// ----------- Types -------------

export type passwordInput = {
    password: string;
    password_confirmation: string;
}

export interface UserInput {
    firstname: string;
    lastname: string;
    phone: string;
    address: string;
    role_name: string;
    is_active: boolean;
    email: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des utilisateurs", href: admin.users.index().url },
    { title: "Ajouter un utilisateur", href: '#' },
];

export default function Create() {
    const { emit } = useEventBus();
    const isMobile = useIsMobile();

    const initialInputs: UserInput & passwordInput = {
        firstname: '',
        lastname: '',
        phone: '',
        address: '',
        role_name: userRoles[0].value,
        is_active: true,
        email: '',
        password: '',
        password_confirmation: '',
    };

    const form = useForm<UserInput & passwordInput>({ defaultValues: { ...initialInputs } });

    const { control, handleSubmit } = form;

    const {
        post,
        processing,
        errors,
        setData,
        clearErrors,
    } = useInertiaForm<UserInput & passwordInput>({ ...initialInputs });

    const onSubmit = () => {
        post(admin.users.store().url, {
            preserveState: true,
            preserveScroll: 'errors',
            onSuccess: () => emit('user.saved', `Utilisateur correctement ajouté !`, { persist: true }),
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
            <Head title="Ajouter un utilisateur" />
            <div className="p-4 sm:p-6 lg:p-8 ">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Créer un nouveau utilisateur
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Remplissez les informations générales suivantes
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
                                        name="lastname"
                                        label="Nom"
                                        placeholder="Votre nom"
                                        onValueChange={(value) => setData("lastname", value)}
                                        onFocus={() => clearErrors('lastname')}
                                        error={errors.lastname}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="firstname"
                                        label="Prénom"
                                        placeholder="Votre prénom"
                                        onValueChange={(value) => setData("firstname", value)}
                                        onFocus={() => clearErrors('firstname')}
                                        error={errors.firstname}
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
                                <div className="grid md:grid-cols-2 gap-4">
                                    <FormFieldWrapper
                                        control={control}
                                        type="password"
                                        name="password"
                                        label="Mot de passe"
                                        placeholder="**********"
                                        onValueChange={(value) => setData("password", value)}
                                        onFocus={() => clearErrors('password')}
                                        error={errors.password}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        type="password"
                                        name="password_confirmation"
                                        label="Confirmation du mot de passe"
                                        placeholder="**********"
                                        onValueChange={(value) => setData("password_confirmation", value)}
                                        onFocus={() => clearErrors('password_confirmation')}
                                        error={errors.password_confirmation}
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
                            {processing ? "Enregistrement..." : "Créer l'utilisateur"}
                        </Button>
                    </form>
                </Form>
            </div>
        </AppLayout >
    );
}
