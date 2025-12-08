import React from "react";
import { useFieldArray, Control, UseFormWatch, useWatch } from "react-hook-form";
import { AttributeInput, ProductInput } from "../create";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Trash2, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FormFieldWrapper } from "@/components/form-field-wrapper";

type ServerErrors<T = unknown> = { [K in keyof T]?: string; } & { [key: string]: string | undefined; }

interface AttributeFormProps {
    control: Control<ProductInput>;
    aIndex: number;
    removeAttribute: (index: number) => void;
    errors: ServerErrors<AttributeInput>;
    postData: ProductInput;
    setData: (field: keyof ProductInput | string, value: any) => void;
    watch: (value: string) => UseFormWatch<ProductInput>;
}

const AttributeForm: React.FC<AttributeFormProps> = ({
    control,
    aIndex,
    removeAttribute,
    errors,
    postData,
    setData,
    watch
}) => {
    const {
        fields: optionFields,
        append: addOption,
        remove: removeOption,
    } = useFieldArray({
        control,
        name: `attributes.${aIndex}.options` as const,
    });

    const isMobile = useIsMobile();

    const attributeName = useWatch({ control, name: `attributes.${aIndex}.name` });

    return (
        <AccordionItem value={`attribute-${aIndex}`} className="last:border-b-1 border rounded-lg">
            {/* Header with module title + delete button */}
            <div className="flex items-center justify-between">
                <AccordionTrigger className="flex-1 text-left px-4 py-2 font-medium">
                    <>{attributeName && !isMobile ? attributeName : `Option ${aIndex + 1}`}</>
                </AccordionTrigger>

                <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive"
                    size="icon"
                    onClick={() => {
                        removeAttribute(aIndex);
                        const updated = [...postData.attributes];
                        updated.splice(aIndex, 1);
                        setData("attributes", updated);
                    }}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <AccordionContent className="p-4 space-y-4 bg-muted/50">
                {/* Module title */}
                <FormFieldWrapper
                    control={control}
                    name={`attributes.${aIndex}.name`}
                    label="Nom de l'option"
                    placeholder="Nom de l'option"
                    onValueChange={(value) => {
                        const updatedAttributes = [...postData.attributes];
                        updatedAttributes[aIndex] = { ...updatedAttributes[aIndex], name: value };

                        setData("attributes", updatedAttributes);
                    }}
                    error={errors[`attributes.${aIndex}.name`]}
                />
                <Accordion type="multiple" className="w-full space-y-2">
                    {optionFields.map((option, index) => {
                        const optionName = `attributes.${aIndex}.options.${index}.name`;
                        return (
                            <AccordionItem
                                key={option.id}
                                value={`option-${aIndex}-${option.id}`}
                                className="last:border-b-1 border rounded-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <AccordionTrigger className="flex-1 text-left px-4 py-2 font-medium">
                                        <>{watch(optionName) && !isMobile ? watch(optionName) : `Valeur ${index + 1}`}</>
                                    </AccordionTrigger>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-destructive"
                                        size="icon"
                                        onClick={() => {
                                            removeOption(index);

                                            const updatedAttributes = [...postData.attributes];
                                            if (updatedAttributes[aIndex]?.options) {
                                                const updatedOptions = [...updatedAttributes[aIndex].options];
                                                updatedOptions.splice(index, 1);
                                                updatedAttributes[aIndex] = { ...updatedAttributes[aIndex], options: updatedOptions };

                                                setData("attributes", updatedAttributes);
                                            }
                                        }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <AccordionContent className="p-4 bg-white space-y-4">
                                    <FormFieldWrapper
                                        control={control}
                                        name={`attributes.${aIndex}.options.${index}.name`}
                                        label="Valeur d'option"
                                        placeholder="Valeur d'option"
                                        onValueChange={(value) => {
                                            const updatedAttributes = [...postData.attributes];

                                            if (!updatedAttributes[aIndex]) {
                                                updatedAttributes[aIndex] = { name: "", options: [] };
                                            }

                                            if (!updatedAttributes[aIndex].options) {
                                                updatedAttributes[aIndex].options = [];
                                            }

                                            const updatedOptions = [...updatedAttributes[aIndex].options];

                                            updatedOptions[index] = { ...updatedOptions[index], name: value };
                                            updatedAttributes[aIndex] = { ...updatedAttributes[aIndex], options: updatedOptions };

                                            setData("attributes", updatedAttributes);
                                        }}
                                        error={errors[`attributes.${aIndex}.options.${index}.name`]}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
                {errors[`attributes.${aIndex}.options`] && (
                    <p className="text-red-500 text-sm">{errors[`attributes.${aIndex}.options`]}</p>
                )}
                {/* Add new chapter */}
                <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => addOption({ name: "" })}
                >
                    <Plus className="h-4 w-4" /> Ajouter une valeur d'option
                </Button>
            </AccordionContent>
        </AccordionItem>
    );
};

export default AttributeForm;
