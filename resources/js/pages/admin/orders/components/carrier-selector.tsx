import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CarrierRate } from "@/types";

interface CarrierSelectorProps {
    rates: CarrierRate[];
    value: string | number | null;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export function CarrierSelector({
    rates,
    value,
    onChange,
    placeholder = "Choisir un transporteur",
    disabled = false,
}: CarrierSelectorProps) {

    // Convertir la valeur en string pour le Select de Shadcn
    const stringValue = value ? String(value) : "";

    return (
        <div className="space-y-1">
            <Select
                disabled={disabled || rates.length === 0}
                onValueChange={onChange}
                value={stringValue}
            >
                <SelectTrigger>
                    <SelectValue placeholder={rates.length === 0 ? "Aucun transporteur disponible" : placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {rates.map((rate, index) => (
                        <SelectItem key={index} value={String(rate.carrier_id)}>
                            {rate.carrier.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
