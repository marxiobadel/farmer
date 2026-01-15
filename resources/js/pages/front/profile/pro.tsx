import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Address, Cart, Product, Zone } from "@/types";
import ProfileLayout from "@/layouts/profile/layout";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCartMetrics } from "@/hooks/use-cart-metrics";
import { useShippingCost } from "@/hooks/use-shipping-cost";
import { Form } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { ProductSelector } from "@/components/ecommerce/product-selector";
import { ProductVariantsTable } from "@/components/ecommerce/variants-table";
import { calculateTotalQty, formattedCartItems } from "@/lib/utils";
import { CartSummary } from "@/components/ecommerce/cart-summary";
import { AddressSelector } from "@/components/ecommerce/address-selector";
import { ZoneSelector } from "@/components/ecommerce/zone-selector";
import { CarrierSelector } from "@/components/ecommerce/carrier-selector";
import { paymentMethods } from "@/data";
import { Button } from "@/components/ui/button";
import profile from "@/routes/profile";

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

    const zoneRates = selectedZone?.rates || [];

    const currentProductId = watch("current_product_id");
    const selectedProduct = products.find((p) => p.id === currentProductId);

    const handleAddToCart = (variantId: number | null, price: number) => {
        router.post(profile.carts.add().url, {
            product_id: currentProductId,
            variant_id: variantId,
            price: price
        }, { preserveScroll: true, preserveState: true });
    };

    const handleUpdateQuantity = (id: string, quantity: number) => {
        router.patch(
            profile.carts.items.update({ cartItem: Number(id) }),
            { quantity },
            { preserveScroll: true, preserveState: true, showProgress: false }
        );
    };

    const handleRemoveItem = (id: string) => {
        router.delete(
            profile.carts.items.remove({ cartItem: Number(id) }),
            { preserveScroll: true, preserveState: true, showProgress: false }
        );
    };

    const onSubmit = (data: any) => {
        if (!data.shipping_address_id) {
            form.setError("shipping_address_id", { message: "Veuillez sélectionner une adresse de livraison." });
            toast.error("Adresse manquante !");
            return;
        }

        if (!data.billing_address_id) {
            form.setError("billing_address_id", { message: "Veuillez sélectionner une adresse de facturation." });
            toast.error("Adresse manquante !");
            return;
        }

        if (!data.zone_id) {
            form.setError("zone_id", { message: "Veuillez sélectionner une zone." });
            toast.error("Zone manquante !");
            return;
        }

        if (!data.carrier_id) {
            form.setError("carrier_id", { message: "Veuillez sélectionner un transporteur." });
            toast.error("Transporteur manquant !");
            return;
        }

        if (!cart || cart.items.length === 0) {
            toast.error("Le panier est vide.");
            return;
        }

        delete data.current_product_id;

        router.post('admin.orders.store().url', { ...data, cart_id: cart.id }, {
            preserveState: true,
            onSuccess: () => { },
            onError: (errors) => {
                if (errors.error) {
                    toast.error('Erreur !', { description: errors.error });
                } else {
                    toast.error('Erreur !', { description: `Une erreur est survenue, vérifiez le formulaire.` });
                }
            },
        });
    };

    // 1. Calcul complet des métriques du panier (Poids, Prix, Volume)
    const cartMetrics = useCartMetrics(cart, products);

    // 2. Calcul des frais selon le type de pricing (fixed, weight, price, volume)
    const totalQty = calculateTotalQty(cart.items);
    const shippingCost = useShippingCost(selectedCarrierId, selectedZone, zoneRates, cartMetrics, totalQty);

    const finalTotal = cartMetrics.price + shippingCost;

    return (
        <AppLayout layout="guest">
            <Head title="Espace Pro" />
            <ProfileLayout>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-stone-900">Créer une commande</h2>
                    <p className="text-stone-500 text-sm">Sélectionnez vos produits et remplissez les données nécessaire.</p>
                </div>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {/* Sélection Produit */}
                            <Card className="p-4 shadow-none">
                                <h2 className="text-lg font-semibold mb-2">Ajouter des produits</h2>
                                <FormFieldWrapper
                                    control={control}
                                    name="current_product_id"
                                    label="Rechercher un produit"
                                    renderCustom={() => (
                                        <ProductSelector
                                            products={products}
                                            value={currentProductId}
                                            onSelect={(id) => setValue("current_product_id", id)}
                                        />
                                    )}
                                />
                            </Card>
                            {/* Table Variantes */}
                            {selectedProduct && (
                                <Card className="p-4 shadow-none bg-blue-50/10 border-blue-100">
                                    <h2 className="text-lg font-semibold mb-2 text-blue-900">
                                        Variantes : {selectedProduct.name}
                                    </h2>
                                    <ProductVariantsTable
                                        key={selectedProduct.id}
                                        product={selectedProduct}
                                        onAddToCart={handleAddToCart}
                                    />
                                </Card>
                            )}
                            {/* Panier */}
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-bold mb-2">
                                    Panier ({cart?.items.length || 0})
                                </h2>
                                <CartSummary
                                    items={formattedCartItems(cart)}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                />
                            </Card>
                        </div>
                        {/* Actions */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="p-4 shadow-none">
                                <h2 className="text-lg font-semibold mb-2">Adresse</h2>
                                <div className="space-y-4 border-1 bg-gray-50/50 p-4 rounded-md">
                                    <FormFieldWrapper
                                        control={control}
                                        name="shipping_address_id"
                                        label="Adresse de livraison"
                                        renderCustom={() => (
                                            <AddressSelector
                                                addresses={addresses}
                                                value={watch('shipping_address_id')}
                                                onChange={(val) => {
                                                    setValue("shipping_address_id", val);
                                                    // UX: Si facturation vide, on met la même que livraison
                                                    if (!watch('billing_address_id')) {
                                                        setValue("billing_address_id", val);
                                                    }
                                                }}
                                                placeholder="Choisir l'adresse"
                                            />
                                        )}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="billing_address_id"
                                        label="Adresse de facturation"
                                        renderCustom={() => (
                                            <AddressSelector
                                                addresses={addresses}
                                                value={watch('billing_address_id')}
                                                onChange={(val) => setValue("billing_address_id", val)}
                                                placeholder="Choisir l'adresse"
                                            />
                                        )}
                                    />
                                    {addresses.length === 0 && (
                                        <div className="md:col-span-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                            Vous n'avez pas encore d'adresses enregistrées.
                                        </div>
                                    )}
                                </div>
                            </Card>
                            <Card className="p-4 shadow-none">
                                <h2 className="text-lg font-semibold mb-2">Transporteur</h2>
                                <FormFieldWrapper
                                    control={control}
                                    name="zone_id"
                                    label="Zone *"
                                    renderCustom={() => (
                                        <ZoneSelector
                                            zones={zones}
                                            value={watch('zone_id')}
                                            onSelect={(id) => {
                                                setValue("zone_id", id);
                                                setValue("carrier_id", null);
                                                form.clearErrors("zone_id");
                                            }}
                                        />
                                    )}
                                />
                                {selectedZone && (
                                    <FormFieldWrapper
                                        control={control}
                                        name="carrier_id"
                                        label="Transporteur *"
                                        renderCustom={() => (
                                            <CarrierSelector
                                                rates={zoneRates}
                                                value={watch('carrier_id')}
                                                onChange={(val) => setValue("carrier_id", val)}
                                                placeholder="Choisir un transporteur"
                                            />
                                        )}
                                    />
                                )}
                            </Card>
                            <Card className="p-4 sticky top-6 shadow-none">
                                <h3 className="font-semibold mb-2">Validation</h3>
                                <FormFieldWrapper
                                    control={control}
                                    name="method"
                                    label="Méthode de paiement"
                                    type="select"
                                    options={paymentMethods}
                                />
                                <div className="space-y-4 mt-4">
                                    {/* Sous-total */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Sous-total :</span>
                                        <span className="font-medium">{formatCurrency(cartMetrics.price)}</span>
                                    </div>

                                    {/* Frais de livraison calculés */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Livraison :</span>
                                        <span className={shippingCost === 0 ? "text-green-600 font-medium" : "font-medium"}>
                                            {shippingCost === 0 && selectedCarrierId
                                                ? "Gratuit"
                                                : formatCurrency(shippingCost)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                                        <span className="text-gray-500">Métrique utilisée :</span>
                                        <span>
                                            {(() => {
                                                // On retrouve le carrier info (copie logicielle rapide pour l'affichage)
                                                const rates = (selectedZone?.rates || []).filter(r => String(r.carrier_id) === String(selectedCarrierId));
                                                const info = rates[0]?.carrier;
                                                if (!info) return "-";

                                                switch (info.pricing_type) {
                                                    case 'weight': return `Poids : ${cartMetrics.weight} kg`;
                                                    case 'volume': return `Volume : ${cartMetrics.volume} cm³`; // ou cm3
                                                    case 'price': return `Montant : ${cartMetrics.price}`;
                                                    case 'fixed': return "Forfait fixe";
                                                    default: return "-";
                                                }
                                            })()}
                                        </span>
                                    </div>

                                    {/* Total Final */}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total :</span>
                                        <span className="text-primary">
                                            {formatCurrency(finalTotal)}
                                        </span>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={!cart || cart.items.length === 0}
                                    >
                                        Créer la commande
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </form>
                </Form>
            </ProfileLayout>
        </AppLayout>
    );
}
