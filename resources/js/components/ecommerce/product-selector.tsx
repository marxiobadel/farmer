import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

interface ProductSelectorProps {
    products: Product[];
    value: string | number | null;
    onSelect: (id: number | null) => void;
}

export function ProductSelector({ products, value, onSelect }: ProductSelectorProps) {
    const [open, setOpen] = useState(false);

    // Trouver le produit sélectionné pour afficher son nom
    const selectedProduct = products.find((p) => p.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedProduct?.name || "Sélectionner un produit"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher un produit..." />
                    <CommandList>
                        <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                        <CommandGroup>
                            {products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={product.name}
                                    onSelect={() => {
                                        onSelect(product.id);
                                        setOpen(false); // Ferme le popover après sélection
                                    }}
                                >
                                    <Check
                                        className={cn("mr-2 h-4 w-4", value === product.id ? "opacity-100" : "opacity-0")}
                                    />
                                    {product.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
