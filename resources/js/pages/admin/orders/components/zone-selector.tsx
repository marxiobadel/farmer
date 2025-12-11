import { Check, ChevronsUpDown, Tractor } from "lucide-react";
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
import { Zone } from "@/types";

interface ZoneSelectorProps {
    zones: Zone[];
    value: string | number | null;
    onSelect: (id: number) => void;
}

export function ZoneSelector({ zones, value, onSelect }: ZoneSelectorProps) {
    const [open, setOpen] = useState(false);

    const selectedZone = zones.find((z) => z.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between pl-3 font-normal", !value && "text-muted-foreground")}
                >
                    {selectedZone ? (
                        <span className="flex items-center gap-2 truncate">
                            <Tractor className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedZone.name}</span>
                        </span>
                    ) : (
                        "Sélectionner une zone"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Rechercher une zone..." />
                    <CommandList>
                        <CommandEmpty>Aucune zone trouvée.</CommandEmpty>
                        <CommandGroup>
                            {zones.map((zone) => (
                                <CommandItem
                                    key={zone.id}
                                    value={zone.name}
                                    onSelect={() => {
                                        onSelect(zone.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === zone.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {zone.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
