import React from "react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { Zone } from "@/types";
import { CarrierInput, RateInput } from "../create";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type ServerErrors<T = unknown> = { [K in keyof T]?: string } & { [key: string]: string | undefined };

interface RateFormProps {
    control: Control<CarrierInput>;
    index: number;
    remove: (index: number) => void;
    errors: ServerErrors<RateInput>;
    postData: CarrierInput;
    zones: Zone[];
    setData: (field: keyof CarrierInput | string, value: any) => void;
}

const RateForm: React.FC<RateFormProps> = ({
    control,
    index,
    remove,
    errors,
    postData,
    zones,
    setData,
}) => {
    const updateRate = (field: keyof RateInput, value: any) => {
        const updated = [...postData.rates];
        updated[index] = { ...updated[index], [field]: value };
        setData("rates", updated);
    };

    return (
        <AccordionItem value={`rate-${index}`} className="border rounded-lg last:border-b-1">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <AccordionTrigger className="flex-1 text-left px-4 py-2">
                    Option {index + 1}
                </AccordionTrigger>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => {
                        remove(index);
                        const updated = [...postData.rates];
                        updated.splice(index, 1);
                        setData("rates", updated);
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* CONTENT */}
            <AccordionContent className="p-4 space-y-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* WEIGHT MIN */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.min_weight`}
                        label="Poids min"
                        type="number"
                        placeholder="Min"
                        onValueChange={(v) => updateRate("min_weight", v)}
                        error={errors[`rates.${index}.min_weight`]}
                    />

                    {/* WEIGHT MAX */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.max_weight`}
                        label="Poids max"
                        type="number"
                        placeholder="Max"
                        onValueChange={(v) => updateRate("max_weight", v)}
                        error={errors[`rates.${index}.max_weight`]}
                    />

                    {/* PRICE MIN */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.min_price`}
                        label="Prix min"
                        type="number"
                        placeholder="Min"
                        onValueChange={(v) => updateRate("min_price", v)}
                        error={errors[`rates.${index}.min_price`]}
                    />

                    {/* PRICE MAX */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.max_price`}
                        label="Prix max"
                        type="number"
                        placeholder="Max"
                        onValueChange={(v) => updateRate("max_price", v)}
                        error={errors[`rates.${index}.max_price`]}
                    />

                    {/* VOLUME MIN */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.min_volume`}
                        label="Volume min"
                        type="number"
                        placeholder="Min"
                        onValueChange={(v) => updateRate("min_volume", v)}
                        error={errors[`rates.${index}.min_volume`]}
                    />

                    {/* VOLUME MAX */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.max_volume`}
                        label="Volume max"
                        type="number"
                        placeholder="Max"
                        onValueChange={(v) => updateRate("max_volume", v)}
                        error={errors[`rates.${index}.max_volume`]}
                    />

                    {/* DELIVERY TIME */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.delivery_time`}
                        label="Délai de livraison"
                        placeholder="ex : 2-3 jours"
                        onValueChange={(v) => updateRate("delivery_time", v)}
                        error={errors[`rates.${index}.delivery_time`]}
                    />

                    {/* ZONE SELECT */}
                    <FormFieldWrapper
                        control={control}
                        name={`rates.${index}.zone_id`}
                        label="Zone"
                        error={errors[`rates.${index}.zone_id`]}
                        renderCustom={() => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {zones.find(z => z.id === postData.rates[index]?.zone_id)?.name || "Sélectionner une zone"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher une zone..." />
                                        <CommandList>
                                            <CommandEmpty>Aucune zone trouvée.</CommandEmpty>

                                            <CommandGroup>
                                                <CommandItem
                                                    value="0"
                                                    onSelect={() => updateRate("zone_id", null)}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", postData.rates[index]?.zone_id === null ? "opacity-100" : "opacity-0")} />
                                                    Aucune
                                                </CommandItem>

                                                {zones.map(zone => (
                                                    <CommandItem
                                                        key={zone.id}
                                                        value={String(zone.id)}
                                                        onSelect={() => updateRate("zone_id", zone.id)}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", postData.rates[index]?.zone_id === zone.id ? "opacity-100" : "opacity-0")} />
                                                        {zone.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                </div>

                {/* RATE PRICE */}
                <FormFieldWrapper
                    control={control}
                    name={`rates.${index}.rate_price`}
                    label="Prix"
                    type="number"
                    placeholder="Prix du transport"
                    onValueChange={(v) => updateRate("rate_price", v)}
                    error={errors[`rates.${index}.rate_price`]}
                />
            </AccordionContent>
        </AccordionItem>
    );
};

export default RateForm;
