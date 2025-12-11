import { Check, ChevronsUpDown, User as UserIcon } from "lucide-react";
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
import { cn, formatName } from "@/lib/utils";
import { User } from "@/types";

interface UserSelectorProps {
    users: User[];
    value: string | number | null;
    onSelect: (id: number) => void;
}

export function UserSelector({ users, value, onSelect }: UserSelectorProps) {
    const [open, setOpen] = useState(false);

    const selectedUser = users.find((u) => u.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between pl-3 font-normal", !value && "text-muted-foreground")}
                >
                    {selectedUser ? (
                        <span className="flex items-center gap-2 truncate">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatName(selectedUser.fullname)}</span>
                            <span className="text-xs text-muted-foreground">({selectedUser.email})</span>
                        </span>
                    ) : (
                        "Sélectionner un client"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Rechercher un client..." />
                    <CommandList>
                        <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                        <CommandGroup>
                            {users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={user.name + " " + user.email}
                                    onSelect={() => {
                                        onSelect(user.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === user.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{user.fullname}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
