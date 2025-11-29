import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagsInputProps {
    value: string[];
    onChange: (val: string[]) => void;
    placeholder?: string;
}

export function TagsInput({ value = [], onChange, placeholder }: TagsInputProps) {
    const [inputValue, setInputValue] = useState("");

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue("");
    };

    const removeTag = (tag: string) => {
        onChange(value.filter((t) => t !== tag));
    };

    return (
        <div className="flex flex-wrap items-center gap-2 px-2 py-1 border rounded-md">
            {value.map((tag) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation(); // ✅ prevent bubbling
                            removeTag(tag);
                        }}
                        className="ml-1 rounded-sm hover:bg-red-500 hover:text-white"
                    >
                        <X size={12} />
                    </button>
                </Badge>
            ))}
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                    }
                }}
                className="flex-1 border-none shadow-none focus-visible:ring-0"
                placeholder={placeholder || "Ajouter un tag..."}
            />
        </div>
    );
}
