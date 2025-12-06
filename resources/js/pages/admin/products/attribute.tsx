import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    useForm as useReactHookForm,
    SubmitHandler,
    UseFormReturn,
} from "react-hook-form";
import { useForm as useInertiaForm } from "@inertiajs/react";
import { Form } from "@/components/ui/form";


// TYPES -------------------------------------------------------------------

interface AttributeOption {
    id?: number;
    name: string;
}

type AttributeType =
    | "select"
    | "color"
    | "multi"
    | "text"
    | "number";

interface Attribute {
    id: number;
    name: string;
    type: AttributeType;
    options?: AttributeOption[];
}

interface Product {
    id: number;
    attributes: Attribute[];
}

interface CreateAttributeForm {
    name: string;
    type: AttributeType;
    addToProduct: boolean;
    options: AttributeOption[];
}

interface AssignFormData {
    attribute_ids: number[];
}

interface Props {
    productId: number;
}


// COMPONENT ---------------------------------------------------------------

export default function ProductAttributesEditor({ productId }: Props) {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [productAttributes, setProductAttributes] = useState<number[]>([]);
    const [showCreate, setShowCreate] = useState(false);

    // React Hook Form
    const form = useReactHookForm<CreateAttributeForm>({
        defaultValues: {
            name: "",
            type: "select",
            addToProduct: true,
            options: [{ name: "" }],
        },
    });

    // Inertia Form (assign attributes to product)
    const assignForm = useInertiaForm<AssignFormData>({
        attribute_ids: [],
    });

    // Load attributes + product assigned attributes
    const loadData = async () => {
        const res1 = await axios.get("/api/attributes");
        setAttributes(res1.data.data as Attribute[]);

        const res2 = await axios.get(`/api/products/${productId}`);
        const product: Product = res2.data.data;

        const ids = product.attributes.map((a) => a.id);
        setProductAttributes(ids);
        assignForm.setData("attribute_ids", ids);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Toggle attribute for the product
    const toggle = (id: number) => {
        let updated = [...productAttributes];

        if (updated.includes(id)) {
            updated = updated.filter((x) => x !== id);
        } else {
            updated.push(id);
        }

        setProductAttributes(updated);
        assignForm.setData("attribute_ids", updated);
    };

    const saveAssign = () => {
        assignForm.put(`/products/${productId}`, {
            preserveScroll: true,
        });
    };

    // Add option row
    const addOptionField = () => {
        const opts = form.getValues("options");
        form.setValue("options", [...opts, { name: "" }]);
    };

    // Create attribute
    const createAttribute: SubmitHandler<CreateAttributeForm> = async (data) => {
        const payload = {
            name: data.name,
            type: data.type,
            options: data.options.filter((o) => o.name.trim() !== ""),
        };

        const res = await axios.post("/api/attributes", payload);
        const newAttributeId = res.data.data.id;

        if (data.addToProduct) {
            await axios.post(`/api/products/${productId}/attach-attribute`, {
                attribute_id: newAttributeId,
            });
        }

        form.reset();
        setShowCreate(false);
        loadData();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Attributs du produit</h2>

            {/* LIST ATTRIBUTES */}
            <div className="space-y-3">
                {attributes.map((attr) => (
                    <div
                        key={attr.id}
                        className="border rounded p-3 bg-white flex justify-between"
                    >
                        <label className="flex gap-2 items-center">
                            <input
                                type="checkbox"
                                checked={productAttributes.includes(attr.id)}
                                onChange={() => toggle(attr.id)}
                            />
                            <span className="font-medium">{attr.name}</span>
                        </label>

                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {attr.type}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={saveAssign}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Sauvegarder l’assignation
            </button>

            {/* CREATE ATTRIBUTE BUTTON */}
            <div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    + Ajouter un attribut
                </button>
            </div>

            {/* CREATE ATTRIBUTE FORM */}
            {showCreate && (
                <div className="p-4 border rounded bg-gray-50">
                    <h3 className="font-semibold mb-3">Créer un attribut</h3>

                    <Form {...(form as UseFormReturn<CreateAttributeForm>)}>
                        <form
                            onSubmit={form.handleSubmit(createAttribute)}
                            className="space-y-4"
                        >
                            {/* NAME */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nom de l’attribut
                                </label>
                                <input
                                    {...form.register("name", { required: true })}
                                    className="w-full border rounded px-2 py-1"
                                />
                            </div>

                            {/* TYPE */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Type
                                </label>
                                <select
                                    {...form.register("type")}
                                    className="w-full border rounded px-2 py-1"
                                >
                                    <option value="select">Sélecteur</option>
                                    <option value="color">Couleur</option>
                                    <option value="multi">Multi choix</option>
                                    <option value="text">Texte</option>
                                    <option value="number">Nombre</option>
                                </select>
                            </div>

                            {/* OPTIONS */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Options (valeurs)
                                </label>

                                {form.watch("options").map((_, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input
                                            {...form.register(`options.${i}.name`)}
                                            className="flex-1 border rounded px-2 py-1"
                                            placeholder={`Valeur ${i + 1}`}
                                        />
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addOptionField}
                                    className="text-sm text-blue-600"
                                >
                                    + Ajouter une valeur
                                </button>
                            </div>

                            {/* ADD TO PRODUCT */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...form.register("addToProduct")}
                                    defaultChecked={true}
                                />
                                <span>Ajouter directement à ce produit</span>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-700 text-white rounded"
                                >
                                    Créer l’attribut
                                </button>
                            </div>
                        </form>
                    </Form>
                </div>
            )}
        </div>
    );
}
