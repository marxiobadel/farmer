import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control, FieldValues, Path } from "react-hook-form";
import { ReactNode, useState } from "react";
import { cn, inputClassNames } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";

type InputType =
    | "text"
    | "number"
    | "password"
    | "date"
    | "time"
    | "textarea"
    | "select"
    | "datetime-local"
    | "switch"
    | "custom";

interface BaseOption {
    label: string;
    value: string | number;
}

interface FormFieldWrapperProps<T extends FieldValues> {
    control: Control<T>;
    noLabel?: boolean;
    name: Path<T>;
    label?: string;
    placeholder?: string;
    type?: InputType;
    options?: BaseOption[];
    step?: string | number;
    min?: string | number;
    onValueChange?: (value: any) => void;
    onCheckedChange?: (value: any) => void;
    onFocus?: () => void;
    onOpenChange?: () => void;
    disabled?: boolean;
    renderCustom?: (args: {
        value: any;
        onChange: (val: any) => void;
    }) => ReactNode;
    error?: string;
}

export function FormFieldWrapper<T extends FieldValues>({
    control,
    noLabel = false,
    name,
    label,
    placeholder,
    type = "text",
    options = [],
    step,
    min,
    onValueChange,
    onCheckedChange,
    onFocus,
    onOpenChange,
    disabled,
    renderCustom,
    error,
}: FormFieldWrapperProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn({ "flex items-center justify-between": type === "switch" })}>
                    {!noLabel && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        {renderCustom ? (
                            renderCustom({
                                value: field.value,
                                onChange: (val) => {
                                    field.onChange(val);
                                    onValueChange?.(val);
                                },
                            })
                        ) : type === "textarea" ? (
                            <Textarea
                                placeholder={placeholder}
                                value={field.value || ""}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    onValueChange?.(e.target.value);
                                }}
                                rows={3}
                                disabled={disabled}
                                className={inputClassNames()}
                            />
                        ) : type === "select" ? (
                            <Select
                                value={field.value?.toString() ?? ""}
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    onValueChange?.(value);
                                }}
                                onOpenChange={onOpenChange}
                                disabled={disabled}
                            >
                                <SelectTrigger className={inputClassNames()}>
                                    <SelectValue placeholder={placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value.toString()}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : type === "switch" ? (
                            <Switch
                                checked={!!field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    onCheckedChange?.(checked);
                                }}
                            />
                        ) : type === "password" ? (
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val);
                                        onValueChange?.(val);
                                    }}
                                    onFocus={onFocus}
                                    placeholder="Entrez votre mot de passe"
                                    aria-invalid={!!error}
                                    aria-describedby={error ? "password-error" : undefined}
                                    className={inputClassNames()}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                    className="absolute right-[10px] top-1/2 -translate-y-1/2 z-10"
                                >
                                    {showPassword ? <Eye className="text-global-6" size={20} /> : <EyeOff className="text-global-6" size={20} />}
                                </button>
                            </div>
                        ) : (
                            <Input
                                type={type}
                                placeholder={placeholder}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                    const val =
                                        type === "number"
                                            ? parseFloat(e.target.value) || 0
                                            : e.target.value;
                                    field.onChange(val);
                                    onValueChange?.(val);
                                }}
                                onFocus={onFocus}
                                step={step}
                                min={min}
                                disabled={disabled}
                                className={inputClassNames()}
                            />
                        )}
                    </FormControl>

                    <FormMessage />

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </FormItem>
            )}
        />
    );
}
