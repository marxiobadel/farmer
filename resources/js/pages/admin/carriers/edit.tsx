import { useEventBus } from "@/context/event-bus-context";
import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import type { BreadcrumbItem, Carrier, Zone } from "@/types";
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
import { CarrierFormData, CarrierInput } from "./create";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des transporteurs", href: admin.carriers.index().url },
    { title: "Modifier un transporteur", href: "#" },
];

interface PageProps {
    carrier: Carrier;
    zones: Zone[];
}

export default function Edit({ carrier, zones }: PageProps) {
    const { emit } = useEventBus();
    const isMobile = useIsMobile();

    const initialInputs: CarrierInput = {
        name: carrier.name ?? "",
        description: carrier.description ?? "",
        base_price: carrier.base_price?.toString() ?? "",
        free_shipping_min: carrier.free_shipping_min?.toString() ?? "",
        is_active: carrier.is_active ?? true,
        pricing_type: (carrier.pricing_type as CarrierInput["pricing_type"]) ?? "fixed",
        rates:
            carrier.rates?.map((rate) => ({
                id: rate.id,
                min_weight: rate.min_weight?.toString() ?? "",
                max_weight: rate.max_weight?.toString() ?? "",
                min_price: rate.min_price?.toString() ?? "",
                max_price: rate.max_price?.toString() ?? "",
                min_volume: rate.min_volume?.toString() ?? "",
                max_volume: rate.max_volume?.toString() ?? "",
                rate_price: rate.rate_price?.toString() ?? "",
                delivery_time: rate.delivery_time ?? "",
                zone_id: rate.zone_id ?? null,
            })) ?? [],
    };

    const form = useForm<CarrierInput>({ defaultValues: { ...initialInputs }, });

    const { control, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({ control, name: "rates" });

    const {
        put,
        processing,
        errors,
        setData,
        data,
        clearErrors,
    } = useInertiaForm<CarrierFormData>({
        ...initialInputs
    });

    const onSubmit = () => {
        put(admin.carriers.update(carrier.id).url, {
            preserveState: true,
            preserveScroll: 'errors',
            onSuccess: () => emit('Carrier.saved', `Transporteur modifié avec succès !`, { persist: true }),
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
            <Head title="Ajouter un produit" />
            <div className="p-4 sm:p-6 lg:p-8 ">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modifier le transporteur
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Modifiez les informations du transporteur.
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
                            {processing ? "Enregistrement..." : "Modifier le transporteur"}
                        </Button>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
