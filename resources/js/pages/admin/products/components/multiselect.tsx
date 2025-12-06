import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandInput, CommandEmpty } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { inputClassNames } from "@/lib/utils";

export interface Category {
    id: number | string;
    name: string;
}

interface CategoriesMultiSelectProps {
    categories: Category[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}

const CategoriesMultiSelect: React.FC<CategoriesMultiSelectProps> = ({
    categories,
    value,
    onChange,
    placeholder = "Choisir une catégorie"
}) => {
    const selectedNames =
        value.length > 0
            ? categories
                .filter((c) => value.includes(String(c.id)))
                .map((c) => c.name)
                .join(", ")
            : placeholder;

    const toggleCategory = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between overflow-hidden">
                    {selectedNames}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher une catégorie..." />
                    <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>

                    <CommandGroup>
                        {categories.map((cat) => {
                            const id = String(cat.id);
                            const isSelected = value.includes(id);

                            return (
                                <CommandItem
                                    key={id}
                                    onSelect={() => toggleCategory(id)}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox checked={isSelected} className={inputClassNames('bg-white')}/>
                                    <span>{cat.name}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default CategoriesMultiSelect;
