import { useEventBus } from "@/context/event-bus-context";
import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import type { BreadcrumbItem, Zone } from "@/types";
import { Head, useForm as useInertiaForm } from "@inertiajs/react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Accordion } from "@/components/ui/accordion";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { pricingTypes } from "@/data";
import RateForm from "./components/rate-form";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des transporteurs", href: admin.carriers.index().url },
    { title: "Ajouter un transporteur", href: '#' },
];

export interface RateInput {
    min_weight: string;
    max_weight: string;
    min_price: string;
    max_price: string;
    min_volume: string;
    max_volume: string;
    rate_price: string;
    coefficient: string;
    delivery_time: string;
    zone_id: string | null | number,
}

export interface CarrierInput {
    name: string;
    description: string;
    base_price?: string;
    free_shipping_min: string;
    is_active: boolean;
    pricing_type: 'fixed' | 'weight' | 'price' | 'volume';
    rates: RateInput[],
}

export type CarrierFormData = CarrierInput & Record<string, any>;

interface PageProps {
    zones: Zone[];
}

export default function Create({ zones }: PageProps) {
    const { emit } = useEventBus();
    const isMobile = useIsMobile();

    const initialInputs: CarrierInput = {
        name: '',
        description: '',
        base_price: '',
        free_shipping_min: '',
        is_active: true,
        pricing_type: 'fixed',
        rates: [],
    };

    const form = useForm<CarrierInput>({ defaultValues: { ...initialInputs }, });

    const { control, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({ control, name: "rates" });

    const {
        post,
        processing,
        errors,
        setData,
        data,
        clearErrors,
    } = useInertiaForm<CarrierFormData>({
        ...initialInputs
    });

    const onSubmit = () => {
        post(admin.carriers.store().url, {
            preserveState: true,
            preserveScroll: 'errors',
            onSuccess: () => emit('carrier.saved', `Transporteur ajouté avec succès !`, { persist: true }),
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
            <Head title="Ajouter un transporteur" />
            <div className="p-4 sm:p-6 lg:p-8 ">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Créer un nouveau transporteur
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Remplissez les informations générales.
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid grid-cols-1 lg:grid-cols-4 md:space-x-4 space-y-4"
                    >
                        <div className="md:col-span-2 lg:col-span-3 space-y-4">
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-1">
                                    Informations de base
                                </h2>
                                <FormFieldWrapper
                                    control={control}
                                    name="name"
                                    label="Nom *"
                                    placeholder="Ex: DHL"
                                    onValueChange={(value) => setData("name", value)}
                                    onFocus={() => clearErrors('name')}
                                    error={errors.name}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name="description"
                                    label="Description"
                                    type="textarea"
                                    placeholder="Description..."
                                    onValueChange={(value) => setData("description", value)}
                                    error={errors.description}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormFieldWrapper
                                        control={control}
                                        name="base_price"
                                        type="number"
                                        label="Prix de base *"
                                        onValueChange={(value) => setData("base_price", value)}
                                        onFocus={() => clearErrors('base_price')}
                                        error={errors.base_price}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="free_shipping_min"
                                        type="number"
                                        label="Seuil de gratuité *"
                                        onValueChange={(value) => setData("free_shipping_min", value)}
                                        onFocus={() => clearErrors('free_shipping_min')}
                                        error={errors.free_shipping_min}
                                    />
                                </div>
                            </Card>

                            <Card className="p-4 space-y-4 shadow-none">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Tarification</h2>
                                    <p className="text-sm text-muted-foreground mb-4">Crée chaque tarif associé au transporteur.</p>

                                    <Accordion
                                        type="multiple"
                                        className="space-y-2 w-full"
                                    >
                                        {fields.map((field, index) => (
                                            <RateForm
                                                key={field.id}
                                                control={control}
                                                index={index}
                                                remove={remove}
                                                errors={errors as any}
                                                postData={data}
                                                zones={zones}
                                                setData={setData}
                                            />
                                        ))}
                                    </Accordion>
                                    {errors.rates && (
                                        <p className="text-red-500 text-sm mt-2">{errors.rates}</p>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4 flex items-center gap-2"
                                        onClick={() => append({
                                            min_weight: '',
                                            max_weight: '',
                                            min_price: '',
                                            max_price: '',
                                            min_volume: '',
                                            max_volume: '',
                                            rate_price: '',
                                            coefficient: '1',
                                            delivery_time: '',
                                            zone_id: null
                                        })}
                                    >
                                        <PlusCircle className="h-4 w-4" /> Ajouter une autre tarification
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        <div className="md:col-span-2 lg:col-span-1 space-y-4">
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-1">Annexe</h2>
                                <FormFieldWrapper
                                    control={control}
                                    name="pricing_type"
                                    label="Type"
                                    type="select"
                                    placeholder="Choisir le Type"
                                    options={pricingTypes}
                                    onOpenChange={() => clearErrors('pricing_type')}
                                    onValueChange={(value) => setData("pricing_type", value)}
                                    error={errors.pricing_type}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name="is_active"
                                    label="Statut"
                                    type="switch"
                                    onCheckedChange={(checked) => setData("is_active", checked)}
                                />
                            </Card>
                        </div>
                        <Button type="submit" disabled={processing} className="mt-6 w-full">
                            {processing ? "Enregistrement..." : "Créer le transporteur"}
                        </Button>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
