import { useMemo, useEffect, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrencyFormatter } from "@/hooks/use-currency";
import { Check, Loader2, MapPin, Truck, Wallet, AlertCircle, Box, Scale, Coins, Plus, Building, Home, ChevronsUpDown } from "lucide-react";
import { calculateTotalQty, cn } from "@/lib/utils";
import InputError from "@/components/input-error";
import { toast } from "sonner";
import { Address, CarrierRate, Cart, Country, SharedData, Zone, Product } from "@/types";
import orders from "@/routes/orders";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface PageProps {
    products: Product[];
    cart: Cart;
    zones: Zone[];
    countries: Country[];
    user_addresses: Address[];
}

export default function CheckoutCreate({ cart, zones, countries, user_addresses, products }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    const formatCurrency = useCurrencyFormatter();

    // --- ETATS LOCAUX ---

    // Gestion "Nouvelle adresse vs Adresse existante"
    // Si l'utilisateur a des adresses, on prend la par défaut, sinon 'new'
    const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>(
        user_addresses.length > 0
            ? String(user_addresses.find(a => a.is_default)?.id || user_addresses[0].id)
            : 'new'
    );

    const [useBillingAddress, setUseBillingAddress] = useState(false);
    const [saveAddress, setSaveAddress] = useState(false);

    // --- FORMULAIRE ---
    const form = useForm({
        firstname: auth.user?.firstname || "",
        lastname: auth.user?.lastname || "",
        phone: auth.user?.phone || "",

        // AJOUT : zone_id intégré au formulaire
        zone_id: "",

        shipping_address: {
            alias: "",
            address: "", // Rue / Quartier
            city: "",
            state: "",
            postal_code: "",
            country_id: "" as string | null,
        },
        billing_address: {
            address: "",
            city: "",
        },
        use_billing_address: false,
        save_address: false,
        carrier_id: "",
        payment_method: "orange_money",
        payment_phone: auth.user?.phone || "",
    });

    // --- LOGIQUE : Pré-remplissage au changement d'adresse ---
    useEffect(() => {
        if (selectedAddressId === 'new') {
            // Cas : Nouvelle adresse
            // On garde les infos de base de l'user connecte, mais on vide l'adresse
            if (user_addresses.length > 0) {
                form.setData(data => ({
                    ...data,
                    firstname: auth.user?.firstname || "",
                    lastname: auth.user?.lastname || "",
                    phone: auth.user?.phone || "",
                    shipping_address: { alias: "", address: "", city: "", state: "", postal_code: "", country_id: "" },
                    // On ne reset pas forcément la zone ici pour laisser le choix à l'utilisateur,
                    // ou on peut la reset si on veut forcer une nouvelle sélection :
                    // zone_id: ""
                }));
            }
        } else {
            // Cas : Adresse existante sélectionnée
            const addr = user_addresses.find(a => String(a.id) === selectedAddressId);
            if (addr) {
                // On essaie de retrouver la Zone correspondant au Pays de l'adresse
                const matchingZone = zones.find(z => String(z.country_id) === String(addr.country_id));

                form.setData(data => ({
                    ...data,
                    firstname: addr.firstname,
                    lastname: addr.lastname,
                    phone: addr.phone,
                    // Si une zone correspond à l'adresse, on la sélectionne automatiquement
                    zone_id: matchingZone ? String(matchingZone.id) : data.zone_id,
                    shipping_address: {
                        alias: addr.alias || "",
                        address: addr.address,
                        city: addr.city,
                        state: addr.state || "",
                        postal_code: addr.postal_code || "",
                        country_id: String(addr.country_id),
                    }
                }));
            }
        }
    }, [selectedAddressId, user_addresses]);

    // --- LOGIQUE : Calcul des Métriques Panier ---
    const cartMetrics = useMemo(() => {
        if (!cart) return { weight: 0, price: 0, volume: 0 };

        return cart.items.reduce((acc, item) => {
            const product = products.find(p => p.id === item.product_id);

            // Calcul Volume (cm3)
            const itemVolume = (
                (product?.length || 0) * (product?.width || 0) * (product?.height || 0)
            ) * item.quantity;

            return {
                weight: acc.weight + ((product?.weight || 0) * item.quantity),
                price: acc.price + (item.price * item.quantity),
                volume: acc.volume + itemVolume
            };
        }, { weight: 0, price: 0, volume: 0 });
    }, [cart, products]);

    // --- LOGIQUE : Zone Sélectionnée (Dérivée du formulaire) ---
    const selectedZone = useMemo(() => {
        if (!form.data.zone_id) return null;
        return zones.find(z => String(z.id) === String(form.data.zone_id)) || null;
    }, [form.data.zone_id, zones]);

    // Sync Zone -> Form Country (Si c'est une nouvelle adresse)
    useEffect(() => {
        if (selectedZone && selectedZone.country_id && selectedAddressId === 'new') {
            form.setData(data => ({
                ...data,
                carrier_id: "", // Reset du transporteur car la zone a changé
                shipping_address: {
                    ...data.shipping_address,
                    country_id: String(selectedZone.country_id)
                }
            }));
        }
    }, [selectedZone, selectedAddressId]);

    // --- LOGIQUE : Transporteurs Disponibles ---
    const availableCarriers = useMemo(() => {
        if (!selectedZone) return [];
        const carriersMap = new Map();
        selectedZone.rates.forEach(rate => {
            if (!carriersMap.has(rate.carrier.id)) {
                carriersMap.set(rate.carrier.id, rate.carrier);
            }
        });
        return Array.from(carriersMap.values());
    }, [selectedZone]);

    // --- LOGIQUE : Calcul des Frais de Port ---
    const shippingCost = useMemo(() => {
        const carrierId = form.data.carrier_id;
        if (!carrierId || !selectedZone) return 0;

        const carrierRates = selectedZone.rates.filter(r => String(r.carrier_id) === String(carrierId));
        const carrierInfo = carrierRates.length > 0 ? carrierRates[0].carrier : null;

        if (!carrierInfo) return 0;

        // Règle 1: Gratuité
        if (carrierInfo.free_shipping_min && cartMetrics.price >= carrierInfo.free_shipping_min) {
            return 0;
        }

        const basePrice = Number(carrierInfo.base_price || 0);
        const type = carrierInfo.pricing_type;

        // Règle 2: Prix Fixe
        if (type === 'fixed') return basePrice;

        // Règle 3: Tranches (Poids, Prix, Volume)
        let matchedRate: CarrierRate | undefined;

        if (type === 'weight') {
            matchedRate = carrierRates.find(r => {
                const max = r.max_weight !== null ? Number(r.max_weight) : Infinity;
                return cartMetrics.weight >= (r.min_weight || 0) && cartMetrics.weight <= max;
            });
        } else if (type === 'price') {
            matchedRate = carrierRates.find(r => {
                const max = r.max_price !== null ? Number(r.max_price) : Infinity;
                return cartMetrics.price >= (r.min_price || 0) && cartMetrics.price <= max;
            });
        } else if (type === 'volume') {
            matchedRate = carrierRates.find(r => {
                const max = r.max_volume !== null ? Number(r.max_volume) : Infinity;
                return cartMetrics.volume >= (r.min_volume || 0) && cartMetrics.volume <= max;
            });
        }

        const totalQty = calculateTotalQty(cart.items);

        if (matchedRate) {
            if (matchedRate.coefficient === 'quantity') {
                return basePrice + Number(matchedRate.rate_price) * totalQty;
            } else {
                return basePrice + Number(matchedRate.rate_price);
            }
        }

        return basePrice;
    }, [form.data.carrier_id, selectedZone, cartMetrics]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.data.carrier_id) {
            toast.error("Veuillez sélectionner un mode de livraison");
            return;
        }

        // Préparation des données pour l'envoi
        form.transform((data) => ({
            ...data,
            use_billing_address: useBillingAddress,
            save_address: saveAddress,
        }));

        form.post(orders.store().url, {
            preserveScroll: 'errors',
            preserveState: true,
            onError: () => toast.error("Veuillez vérifier les informations du formulaire.")
        });
    };

    const grandTotal = cartMetrics.price + shippingCost;
    const isNewAddress = selectedAddressId === 'new';

    return (
        <AppLayout layout="guest">
            <Head title="Paiement" />

            <div className="bg-stone-50/50 min-h-screen py-10 lg:py-14 font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-end justify-between">
                        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Finaliser ma commande</h1>
                        <span className="text-sm text-stone-500 font-medium hidden sm:block">
                            Étape 2 sur 2
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">

                        {/* COLONNE GAUCHE (Formulaire) */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* 1. Adresse & Contact */}
                            <Card className="border-stone-200 shadow-none overflow-hidden">
                                <CardHeader className="px-4 sm:px-6 bg-stone-50/50 border-b border-stone-100 py-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-sm">1</div>
                                        Livraison & Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">

                                    {/* SÉLECTEUR D'ADRESSES (Pour utilisateurs connectés) */}
                                    {auth.user && user_addresses.length > 0 && (
                                        <div className="mb-6 animate-in fade-in">
                                            <Label className="text-stone-500 mb-3 block text-xs uppercase tracking-wide font-semibold">Mes adresses</Label>
                                            <RadioGroup
                                                value={selectedAddressId}
                                                onValueChange={setSelectedAddressId}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                            >
                                                {user_addresses.map((addr) => (
                                                    <div key={addr.id} className="relative">
                                                        <RadioGroupItem value={String(addr.id)} id={`addr-${addr.id}`} className="peer sr-only" />
                                                        <Label htmlFor={`addr-${addr.id}`} className="flex flex-col p-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                                                                    {addr.alias === 'Bureau' ? <Building className="h-3.5 w-3.5" /> : <Home className="h-3.5 w-3.5" />}
                                                                    {addr.alias || 'Mon adresse'}
                                                                </span>
                                                                {selectedAddressId === String(addr.id) && <Check className="h-4 w-4 text-primary" />}
                                                            </div>
                                                            <p className="text-sm text-stone-600 line-clamp-1 font-medium">{addr.address}</p>
                                                            <p className="text-xs text-stone-400 mt-1">{addr.city}</p>
                                                        </Label>
                                                    </div>
                                                ))}
                                                {/* Bouton pour créer une nouvelle adresse */}
                                                <div className="relative">
                                                    <RadioGroupItem value="new" id="addr-new" className="peer sr-only" />
                                                    <Label htmlFor="addr-new" className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 hover:bg-white hover:border-primary/50 text-stone-500 hover:text-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-white cursor-pointer transition-all h-full min-h-[100px]">
                                                        <Plus className="h-6 w-6 mb-2" />
                                                        <span className="font-medium text-sm">Nouvelle adresse</span>
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}

                                    {/* FORMULAIRE (Affiché si Guest ou "Nouvelle Adresse" sélectionnée)
                                        Si une adresse existante est sélectionnée, les champs sont remplis et désactivés visuellement */}
                                    <div className={cn("space-y-4 transition-opacity duration-300", !isNewAddress && "opacity-75 grayscale-[0.5] pointer-events-none")}>

                                        {/* Champs Identité */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Prénom</Label>
                                                <Input
                                                    value={form.data.firstname}
                                                    onChange={e => form.setData('firstname', e.target.value)}
                                                    className="bg-white mt-1.5"
                                                />
                                                <InputError message={form.errors.firstname} />
                                            </div>
                                            <div>
                                                <Label>Nom</Label>
                                                <Input
                                                    value={form.data.lastname}
                                                    onChange={e => form.setData('lastname', e.target.value)}
                                                    className="bg-white mt-1.5"
                                                />
                                                <InputError message={form.errors.lastname} />
                                            </div>
                                            <div className={cn(isNewAddress && auth.user ? "" : "md:col-span-2")}>
                                                <Label>Téléphone</Label>
                                                <Input
                                                    value={form.data.phone}
                                                    onChange={e => form.setData('phone', e.target.value)}
                                                    className="bg-white mt-1.5"
                                                    placeholder="Ex: 699 00 00 00"
                                                />
                                                <InputError message={form.errors.phone} />
                                            </div>
                                            {/* Champ Alias (Visible seulement si création pour user connecté) */}
                                            {isNewAddress && auth.user && (
                                                <div>
                                                    <Label>Alias</Label>
                                                    <Input
                                                        value={form.data.shipping_address.alias}
                                                        onChange={e => form.setData('shipping_address', { ...form.data.shipping_address, alias: e.target.value })}
                                                        className="bg-white mt-1.5"
                                                        placeholder="Ex: Maison, Bureau..."
                                                    />
                                                    <InputError message={form.errors['shipping_address.alias']} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-dashed border-stone-200 my-4" />

                                        {/* Champs Adresse */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Label>Zone de livraison</Label>
                                                {/* Le choix de la zone est crucial : il détermine les transporteurs et le pays */}
                                                <Select
                                                    value={form.data.zone_id}
                                                    onValueChange={(val) => {
                                                        if (!isNewAddress) return;
                                                        form.setData('zone_id', val);
                                                    }}
                                                    disabled={!isNewAddress}
                                                >
                                                    <SelectTrigger className="bg-white mt-1.5">
                                                        <SelectValue placeholder="Sélectionner une zone..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={form.errors['zone_id'] || form.errors['shipping_address.country_id']} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label>Adresse (Rue, Quartier)</Label>
                                                <Input
                                                    value={form.data.shipping_address.address}
                                                    onChange={e => form.setData('shipping_address', { ...form.data.shipping_address, address: e.target.value })}
                                                    className="bg-white mt-1.5"
                                                />
                                                <InputError message={form.errors['shipping_address.address']} />
                                            </div>
                                            <div>
                                                <Label>Ville</Label>
                                                <Input
                                                    value={form.data.shipping_address.city}
                                                    onChange={e => form.setData('shipping_address', { ...form.data.shipping_address, city: e.target.value })}
                                                    className="bg-white mt-1.5"
                                                />
                                                <InputError message={form.errors['shipping_address.city']} />
                                            </div>
                                            <div>
                                                <Label>Région / État</Label>
                                                <Input
                                                    value={form.data.shipping_address.state}
                                                    onChange={e => form.setData('shipping_address', { ...form.data.shipping_address, state: e.target.value })}
                                                    className="bg-white mt-1.5"
                                                />
                                                <InputError message={form.errors['shipping_address.state']} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <Label>Pays</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className="w-full justify-between"
                                                            disabled={true} // Le pays est déterminé par la zone
                                                        >
                                                            {form.data.shipping_address.country_id
                                                                ? (countries.find((c) => String(c.id) === form.data.shipping_address.country_id)?.name ?? "—")
                                                                : "Défini par la zone"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>

                                                    <PopoverContent className="w-[300px] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Rechercher..." />
                                                            <CommandList>
                                                                <CommandEmpty>Aucun pays trouvé.</CommandEmpty>

                                                                <CommandGroup>
                                                                    <CommandItem
                                                                        value="0"
                                                                        onSelect={() => form.setData('shipping_address', { ...form.data.shipping_address, country_id: null })}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", form.data.shipping_address.country_id === null ? "opacity-100" : "opacity-0")} />
                                                                        Aucun
                                                                    </CommandItem>

                                                                    {countries
                                                                        .map((country) => (
                                                                            <CommandItem
                                                                                key={country.id}
                                                                                value={country.name}
                                                                                onSelect={() => form.setData('shipping_address', { ...form.data.shipping_address, country_id: String(country.id) })}
                                                                            >
                                                                                <Check className={cn("mr-2 h-4 w-4", form.data.shipping_address.country_id === String(country.id) ? "opacity-100" : "opacity-0")} />
                                                                                {country.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <InputError message={form.errors['shipping_address.country_id']} />
                                            </div>
                                            <div>
                                                <Label>Code Postal (Optionnel)</Label>
                                                <Input
                                                    value={form.data.shipping_address.postal_code}
                                                    onChange={e => form.setData('shipping_address', { ...form.data.shipping_address, postal_code: e.target.value })}
                                                    className="bg-white mt-1.5"
                                                />
                                                <InputError message={form.errors['shipping_address.postal_code']} />
                                            </div>
                                        </div>

                                        {/* Option Sauvegarde (User Auth & New Address) */}
                                        {auth.user && isNewAddress && (
                                            <div className="flex items-center space-x-2 pt-2">
                                                <Checkbox id="save_addr" checked={saveAddress} onCheckedChange={(c) => setSaveAddress(!!c)} />
                                                <Label htmlFor="save_addr" className="font-normal cursor-pointer text-stone-600">Enregistrer dans mon carnet d'adresses</Label>
                                            </div>
                                        )}
                                    </div>

                                    {/* Option Facturation */}
                                    <div className="flex items-center space-x-2 pt-2 border-t border-stone-100 mt-4">
                                        <Checkbox id="billing_same" checked={!useBillingAddress} onCheckedChange={(c) => setUseBillingAddress(!c)} />
                                        <Label htmlFor="billing_same" className="font-medium cursor-pointer text-stone-700">L'adresse de facturation est identique</Label>
                                    </div>

                                    {useBillingAddress && (
                                        <div className="pt-4 animate-in fade-in slide-in-from-top-2">
                                            <Label className="mb-2 block">Adresse de facturation</Label>
                                            <div className="grid gap-4">
                                                <Input placeholder="Adresse complète" value={form.data.billing_address.address} onChange={e => form.setData('billing_address', { ...form.data.billing_address, address: e.target.value })} className="bg-white" />
                                                <InputError message={form.errors['billing_address.address']} />
                                                <Input placeholder="Ville" value={form.data.billing_address.city} onChange={e => form.setData('billing_address', { ...form.data.billing_address, city: e.target.value })} className="bg-white" />
                                                <InputError message={form.errors['billing_address.city']} />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 2. Transporteur */}
                            <Card className="border-stone-200 shadow-none overflow-hidden">
                                <CardHeader className="px-4 sm:px-6 bg-stone-50/50 border-b border-stone-100 py-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-sm">2</div>
                                        Mode de livraison
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 pt-6">
                                    {!form.data.zone_id ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-stone-500 bg-stone-50/50 rounded-lg border border-dashed border-stone-200">
                                            <MapPin className="h-8 w-8 mb-3 opacity-20" />
                                            <p className="text-sm">Veuillez d'abord sélectionner votre zone de livraison ci-dessus.</p>
                                        </div>
                                    ) : availableCarriers.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-amber-600 bg-amber-50 rounded-lg border border-amber-100">
                                            <AlertCircle className="h-6 w-6 mb-2" />
                                            <p className="text-sm font-medium">Aucun transporteur disponible pour cette zone.</p>
                                        </div>
                                    ) : (
                                        <RadioGroup
                                            value={form.data.carrier_id}
                                            onValueChange={(val) => form.setData('carrier_id', val)}
                                            className="grid grid-cols-1 gap-4"
                                        >
                                            {availableCarriers.map((carrier) => (
                                                <div key={carrier.id}>
                                                    <RadioGroupItem value={String(carrier.id)} id={`c-${carrier.id}`} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={`c-${carrier.id}`}
                                                        className="flex items-center justify-between p-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-white border border-stone-100 p-2.5 rounded-full shadow-sm">
                                                                <Truck className="h-5 w-5 text-stone-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-stone-900">{carrier.name}</div>
                                                                <div className="text-xs text-stone-500 mt-0.5">{carrier.description || "Livraison standard"}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-5 w-5 rounded-full border-2 border-stone-300 peer-checked:border-primary peer-checked:bg-primary" />
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}
                                    <InputError message={form.errors.carrier_id} className="mt-2" />
                                </CardContent>
                            </Card>

                            {/* 3. Paiement */}
                            <Card className="border-stone-200 shadow-none overflow-hidden">
                                <CardHeader className="px-4 sm:px-6 bg-stone-50/50 border-b border-stone-100 py-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-sm">3</div>
                                        Paiement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 pt-6">
                                    <RadioGroup
                                        value={form.data.payment_method}
                                        onValueChange={(val) => {
                                            form.setData('payment_method', val);
                                            // Pré-remplir le numéro si OM/MTN et champ vide
                                            if ((val === 'orange_money' || val === 'mtn_money') && !form.data.payment_phone) {
                                                form.setData(data => ({ ...data, payment_method: val, payment_phone: form.data.phone }));
                                            }
                                        }}
                                        className="space-y-3"
                                    >
                                        {/* OPTION 1: ORANGE MONEY */}
                                        <div className={cn(
                                            "relative rounded-xl border transition-all duration-200 overflow-hidden",
                                            form.data.payment_method === "orange_money" ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500" : "border-stone-200 bg-white hover:border-orange-200 hover:bg-orange-50/10"
                                        )}>
                                            <RadioGroupItem value="orange_money" id="pm_om" className="peer sr-only" />
                                            <Label htmlFor="pm_om" className="flex items-center p-4 cursor-pointer">
                                                <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 mr-4 border border-orange-200 shrink-0"><Wallet className="h-6 w-6" /></div>
                                                <div className="flex-1"><div className="font-bold text-stone-900">Orange Money (CM)</div><div className="text-xs text-stone-500">Paiement mobile sécurisé</div></div>
                                                {form.data.payment_method === "orange_money" && <Check className="h-5 w-5 text-orange-600" />}
                                            </Label>
                                            {form.data.payment_method === "orange_money" && (
                                                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
                                                    <div className="pt-3 border-t border-orange-100">
                                                        <Label htmlFor="om_phone" className="text-xs font-medium text-orange-800 uppercase tracking-wide mb-1.5 block">Numéro Orange Money</Label>
                                                        <Input id="om_phone" placeholder="69X XX XX XX" className="bg-white border-orange-200 focus-visible:ring-orange-500 text-base" value={form.data.payment_phone} onChange={(e) => form.setData('payment_phone', e.target.value)} maxLength={9} />
                                                        <p className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Vous recevrez une demande USSD.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* OPTION 2: MTN MOBILE MONEY */}
                                        <div className={cn(
                                            "relative rounded-xl border transition-all duration-200 overflow-hidden",
                                            form.data.payment_method === "mtn_money" ? "border-yellow-500 bg-yellow-50/30 ring-1 ring-yellow-500" : "border-stone-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/10"
                                        )}>
                                            <RadioGroupItem value="mtn_money" id="pm_momo" className="peer sr-only" />
                                            <Label htmlFor="pm_momo" className="flex items-center p-4 cursor-pointer">
                                                <div className="bg-yellow-100 p-2.5 rounded-lg text-yellow-700 mr-4 border border-yellow-200 shrink-0"><Wallet className="h-6 w-6" /></div>
                                                <div className="flex-1"><div className="font-bold text-stone-900">MTN Mobile Money (CM)</div><div className="text-xs text-stone-500">Paiement mobile sécurisé</div></div>
                                                {form.data.payment_method === "mtn_money" && <Check className="h-5 w-5 text-yellow-600" />}
                                            </Label>
                                            {form.data.payment_method === "mtn_money" && (
                                                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
                                                    <div className="pt-3 border-t border-yellow-100">
                                                        <Label htmlFor="mtn_phone" className="text-xs font-medium text-yellow-800 uppercase tracking-wide mb-1.5 block">Numéro MTN MoMo</Label>
                                                        <Input id="mtn_phone" placeholder="67X XX XX XX" className="bg-white border-yellow-200 focus-visible:ring-yellow-500 text-base" value={form.data.payment_phone} onChange={(e) => form.setData('payment_phone', e.target.value)} maxLength={9} />
                                                        <p className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Tapez *126# pour valider.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* OPTION 3: CASH */}
                                        <div className={cn(
                                            "relative rounded-xl border transition-all duration-200",
                                            form.data.payment_method === "cash" ? "border-green-500 bg-green-50/30 ring-1 ring-green-500" : "border-stone-200 bg-white hover:border-green-200 hover:bg-green-50/10"
                                        )}>
                                            <RadioGroupItem value="cash" id="pm_cash" className="peer sr-only" />
                                            <Label htmlFor="pm_cash" className="flex items-center p-4 cursor-pointer">
                                                <div className="bg-green-100 p-2.5 rounded-lg text-green-700 mr-4 border border-green-200 shrink-0">
                                                    <Coins className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1"><div className="font-bold text-stone-900">Paiement à la livraison</div><div className="text-xs text-stone-500">Payez en espèces à la réception</div></div>
                                                {form.data.payment_method === "cash" && <Check className="h-5 w-5 text-green-600" />}
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                    <InputError message={form.errors.payment_method || form.errors.payment_phone} className="mt-3" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLONNE DROITE (Résumé Sticky) */}
                        <div className="mt-10 lg:mt-0 lg:col-span-5">
                            <div className="sticky top-8">
                                <Card className="shadow-none border-stone-200 overflow-hidden">
                                    <div className="bg-stone-50 p-5 border-b border-stone-100">
                                        <h2 className="font-bold text-stone-900 text-lg">Résumé de la commande</h2>
                                        <p className="text-xs text-stone-500 mt-1">Vérifiez vos articles avant de payer.</p>
                                    </div>

                                    <CardContent className="p-4 sm:p-6">
                                        <div className="max-h-[320px] overflow-y-auto pr-2 space-y-5 mb-8 scrollbar-thin scrollbar-thumb-stone-200">
                                            {cart.items.map((item: any) => (
                                                <div key={item.id} className="flex gap-4 group">
                                                    <div className="h-16 w-16 shrink-0 rounded-lg border border-stone-200 overflow-hidden bg-white shadow-sm">
                                                        <img
                                                            src={item.image || item.product?.default_image || `https://placehold.co/128?text=${encodeURIComponent(item?.product?.name || 'Produit')}`}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-center">
                                                        <div className="font-semibold text-sm text-stone-900 line-clamp-1">{item.name}</div>
                                                        <div className="text-xs text-stone-500 mt-1">{item.variant?.map((v: any) => v.option).join(' / ')}</div>
                                                        <div className="flex justify-between items-center mt-1.5">
                                                            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Qté: {item.quantity}</span>
                                                            <span className="text-sm font-bold text-stone-900">{formatCurrency(item.total)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-dashed border-stone-200 my-6" />

                                        <dl className="space-y-3 text-sm">
                                            {/* Métrique Prix */}
                                            <div className="flex justify-between items-center">
                                                <dt className="text-stone-500 flex items-center gap-2"><Coins className="h-3.5 w-3.5" /> Montant éligible</dt>
                                                <dd className="font-medium text-stone-900">{formatCurrency(cartMetrics.price)}</dd>
                                            </div>
                                            {/* Métrique Poids (si > 0) */}
                                            {cartMetrics.weight > 0 && (
                                                <div className="flex justify-between items-center text-xs text-stone-400">
                                                    <dt className="flex items-center gap-2"><Scale className="h-3.5 w-3.5" /> Poids total</dt>
                                                    <dd>{cartMetrics.weight} kg</dd>
                                                </div>
                                            )}
                                            {/* Métrique Volume (si > 0) */}
                                            {cartMetrics.volume > 0 && (
                                                <div className="flex justify-between items-center text-xs text-stone-400">
                                                    <dt className="flex items-center gap-2"><Box className="h-3.5 w-3.5" /> Volume total</dt>
                                                    <dd>{(cartMetrics.volume / 1000000).toFixed(4)} m³</dd>
                                                </div>
                                            )}

                                            <div className="border-t border-stone-100 my-3" />

                                            <div className="flex justify-between text-stone-600">
                                                <dt>Sous-total</dt>
                                                <dd className="font-semibold">{formatCurrency(cartMetrics.price)}</dd>
                                            </div>
                                            <div className="flex justify-between text-stone-600">
                                                <dt>Livraison</dt>
                                                <dd className={cn(shippingCost === 0 && form.data.carrier_id ? "text-green-600 font-bold" : "font-medium")}>
                                                    {form.data.carrier_id ? (shippingCost === 0 ? "Offert" : formatCurrency(shippingCost)) : "--"}
                                                </dd>
                                            </div>
                                            <div className="border-t border-stone-200 pt-4 flex justify-between items-center mt-4">
                                                <dt className="text-lg font-bold text-stone-900">Total à payer</dt>
                                                <dd className="text-xl font-extrabold text-primary">{formatCurrency(grandTotal)}</dd>
                                            </div>
                                        </dl>

                                        <Button
                                            className="w-full mt-8 h-12 text-base font-bold shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                                            size="lg"
                                            onClick={handleSubmit}
                                            disabled={form.processing || !form.data.carrier_id}
                                        >
                                            {form.processing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement...</> : `Payer ${formatCurrency(grandTotal)}`}
                                        </Button>

                                        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-stone-400">
                                            <Check className="h-3 w-3 text-green-500" /> Paiement sécurisé SSL 256-bit
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
