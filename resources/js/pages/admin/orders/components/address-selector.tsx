import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, inputClassNames } from "@/lib/utils";
import { Address } from "@/types";

interface AddressSelectorProps {
    addresses: Address[];
    value: string | number | null;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
}

export function AddressSelector({
    addresses,
    value,
    onChange,
    placeholder = "Choisir une adresse",
    disabled = false,
}: AddressSelectorProps) {

    // Convertir la valeur en string pour le Select de Shadcn
    const stringValue = value ? String(value) : "";

    return (
        <div className="space-y-1">
            <Select
                disabled={disabled || addresses.length === 0}
                onValueChange={onChange}
                value={stringValue}
            >
                <SelectTrigger className={cn('line-clamp-1', inputClassNames())}>
                    <SelectValue placeholder={addresses.length === 0 ? "Aucune adresse disponible" : placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {addresses.map((addr) => (
                        <SelectItem key={addr.id} value={String(addr.id)}>
                            {/* Personnalisez l'affichage ici */}
                            {addr.address}, {addr.city} {addr.postal_code}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
