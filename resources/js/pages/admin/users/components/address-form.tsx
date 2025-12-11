import React, { useState } from "react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Country } from "@/types";
import { UserInput, AddressInput } from "../create";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

type ServerErrors<T = unknown> = {
    [K in keyof T]?: string;
} & { [key: string]: string | undefined };

interface AddressFormProps {
    control: Control<Partial<UserInput>>;
    index: number;
    remove: (index: number) => void;
    errors: ServerErrors<AddressInput>;
    postData: Partial<UserInput>;
    countries: Country[];
    setData: (field: keyof UserInput | string, value: any) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
    control,
    index,
    remove,
    errors,
    postData,
    countries,
    setData,
}) => {
    // State to manage the open/close status of the country popover
    const [isCountryOpen, setIsCountryOpen] = useState(false);

    const updateAddress = (field: keyof AddressInput, value: any) => {
        const updated = [...(postData.addresses || [])];
        updated[index] = { ...updated[index], [field]: value };
        setData("addresses", updated);
    };

    return (
        <AccordionItem value={`address-${index}`} className="border rounded-lg last:border-b-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <AccordionTrigger className="flex-1 text-left px-4 py-2">
                    Adresse {index + 1}
                </AccordionTrigger>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                        remove(index);
                        const updated = [...(postData.addresses || [])];
                        updated.splice(index, 1);
                        setData("addresses", updated);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <AccordionContent className="p-4 space-y-4 bg-muted/30">

                {/* Identity Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.alias`}
                        label="Alias"
                        placeholder="Ex: Maison, Bureau"
                        onValueChange={(value) => updateAddress("alias", value)}
                        error={errors[`addresses.${index}.alias`]}
                    />

                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.lastname`}
                        label="Nom"
                        placeholder="Nom"
                        onValueChange={(value) => updateAddress("lastname", value)}
                        error={errors[`addresses.${index}.lastname`]}
                    />

                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.firstname`}
                        label="Prénom"
                        placeholder="Prénom"
                        onValueChange={(value) => updateAddress("firstname", value)}
                        error={errors[`addresses.${index}.firstname`]}
                    />
                </div>

                {/* Contact Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.phone`}
                        label="Téléphone"
                        placeholder="+237..."
                        onValueChange={(value) => updateAddress("phone", value)}
                        error={errors[`addresses.${index}.phone`]}
                    />

                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.city`}
                        label="Ville"
                        placeholder="Yaoundé..."
                        onValueChange={(value) => updateAddress("city", value)}
                        error={errors[`addresses.${index}.city`]}
                    />

                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.state`}
                        label="État / Région"
                        placeholder="Centre..."
                        onValueChange={(value) => updateAddress("state", value)}
                        error={errors[`addresses.${index}.state`]}
                    />
                </div>

                {/* Country + CP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.postal_code`}
                        label="Code postal"
                        placeholder="00000"
                        onValueChange={(value) => updateAddress("postal_code", value)}
                        error={errors[`addresses.${index}.postal_code`]}
                    />

                    {/* Country Select - Fixed */}
                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.country_id`}
                        label="Pays"
                        error={errors[`addresses.${index}.country_id`]}
                        renderCustom={() => (
                            <Popover open={isCountryOpen} onOpenChange={setIsCountryOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {countries.find(
                                            (c) => String(c.id) === String((postData.addresses || [])[index]?.country_id)
                                        )?.name || "Sélectionner un pays"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un pays..." />
                                        <CommandList>
                                            <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                {countries.map((country) => (
                                                    <CommandItem
                                                        key={country.id}
                                                        // FIX: Value must be the name to allow searching text
                                                        value={country.name}
                                                        onSelect={() => {
                                                            updateAddress("country_id", country.id);
                                                            setIsCountryOpen(false); // Close popover on selection
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                (postData.addresses || [])[index]?.country_id === country.id
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {country.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    />

                    <FormFieldWrapper
                        control={control}
                        name={`addresses.${index}.is_default`}
                        label="Adresse par défaut"
                        type="switch"
                        onCheckedChange={(checked) => updateAddress("is_default", checked)}
                    />
                </div>

                {/* Main Address Field */}
                <FormFieldWrapper
                    control={control}
                    name={`addresses.${index}.address`}
                    label="Adresse complète"
                    placeholder="Rue, quartier, numéro..."
                    onValueChange={(value) => updateAddress("address", value)}
                    error={errors[`addresses.${index}.address`]}
                />
            </AccordionContent>
        </AccordionItem>
    );
};

export default AddressForm;
