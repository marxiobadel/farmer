import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import type { BreadcrumbItem, Category } from "@/types";
import { Head, useForm as useInertiaForm } from "@inertiajs/react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontFamily } from "@tiptap/extension-text-style";
import TiptapToolbar from "./components/tiptap-toolbar";
import { useCallback, useEffect, useState } from "react";
import ProductImagesUploader, { ImagePreview } from "./components/uploader";
import { TagsInput } from "@/components/tags-input";
import { productStatus } from "@/data";
import CategoriesMultiSelect from "./components/multiselect";
import { Accordion } from "@/components/ui/accordion";
import AttributeForm from "./components/attribute-form";
import { Image, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des produits", href: admin.products.index().url },
    { title: "Ajouter un produit", href: '#' },
];

export interface OptionInput {
    name: string;
}

export interface AttributeInput {
    name: string;
    options: OptionInput[];
}

export interface VariantInput {
    name: string;
    price: string;
    compare_at_price?: string;
    quantity: string;
    is_default: boolean;
    image?: File | string | null;
}

export interface ProductInput {
    name: string;
    description: string;
    meta_description?: string;
    price?: string;
    compare_at_price?: string;
    origin: string;
    quantity: string;
    weight: string;
    height: string;
    width: string;
    length: string;
    category_ids: string[];
    status: "draft" | "published" | "archived";
    tags?: string[];
    attributes: AttributeInput[],
    variants: VariantInput[],
    images: File[];
    default_image: string | null;
}

export type ProductFormData = ProductInput & Record<string, any>;

interface PageProps {
    categories: Category[];
}

export default function Create({ categories }: PageProps) {
    const isMobile = useIsMobile();

    const initialInputs: ProductInput = {
        name: "",
        description: "",
        meta_description: "",
        price: "",
        compare_at_price: "",
        origin: "",
        quantity: "0",
        weight: "",
        height: "",
        width: "",
        length: "",
        category_ids: [],
        status: "draft",
        tags: [],
        attributes: [],
        variants: [],
        images: [],
        default_image: null,
    };

    // Helper to generate Cartesian product
    const cartesianProduct = useCallback((args: any[][]) => {
        const result: any[][] = [];
        const max = args.length - 1;

        function helper(arr: any[], i: number) {
            for (let j = 0; j < args[i].length; j++) {
                const copy = arr.slice();
                copy.push(args[i][j]);
                if (i === max) result.push(copy);
                else helper(copy, i + 1);
            }
        }

        helper([], 0);
        return result;
    }, []);

    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [defaultImage, setDefaultImage] = useState<string | null>(null);

    const form = useForm<ProductInput>({
        defaultValues: { ...initialInputs },
        mode: "onChange"
    });

    const { control, handleSubmit, watch } = form;

    // We watch attributes to trigger variant generation
    const watchedAttributes = useWatch({ control, name: "attributes" });

    const { fields: attributeFields, append: addAttribute, remove: removeAttribute } =
        useFieldArray({ control, name: "attributes" });

    const { fields: variantFields, replace: replaceVariants } =
        useFieldArray({ control, name: "variants" });

    const {
        post,
        processing,
        errors, // Inertia errors
        setData,
        data,
        clearErrors,
    } = useInertiaForm<ProductFormData>({
        ...initialInputs
    });

    // --------------------------------------------------------
    // Dynamic Variant Generation Logic
    // --------------------------------------------------------
    useEffect(() => {
        const attributes = (watchedAttributes || []) as AttributeInput[];

        const validAttributes = attributes.filter(
            (attr) =>
                attr.name &&
                attr.options?.length &&
                attr.options.some((o) => o.name)
        );

        // If empty, wipe variants
        const currentVariants = form.getValues("variants") as VariantInput[];

        if (validAttributes.length === 0) {
            if (currentVariants.length > 0) {
                replaceVariants([]);
                setData("variants", [] as VariantInput[]);
            }
            return;
        }

        const optionsStack = validAttributes.map((attr) =>
            attr.options.filter((o) => o.name).map((o) => o.name)
        );

        if (optionsStack.some((s) => s.length === 0)) return;

        const combos = cartesianProduct(optionsStack);

        const newVariants = combos.map((combo) => {
            const variantName = combo.join(" / ");
            const existing = currentVariants.find((v) => v.name === variantName);

            return {
                name: variantName,
                price: existing?.price ?? form.getValues("price") ?? "",
                compare_at_price: existing?.compare_at_price ?? form.getValues("compare_at_price") ?? "",
                quantity: existing?.quantity ?? "0",
                is_default: existing?.is_default ?? false,
                image: existing?.image ?? null,
            };
        });

        const changed =
            JSON.stringify(newVariants.map((v) => v.name)) !==
            JSON.stringify(currentVariants.map((v) => v.name));

        if (changed) {
            replaceVariants(newVariants);
            setData("variants", newVariants);
        }
    }, [
        JSON.stringify(watchedAttributes), // ⬅ stabilizes the deep structure
        cartesianProduct                   // ⬅ stable callback
    ]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TextStyle,
            FontFamily,
        ],
        content: "",
        onUpdate: ({ editor }) => setData("description", editor.getHTML()),
    });

    const onSubmit = () => {
        post(admin.products.store().url, {
            preserveState: true,
            preserveScroll: 'errors',
            forceFormData: true,
            onError: (errors) => {
                if (errors.error) {
                    toast.error('Erreur !', { description: errors.error });
                } else {
                    toast.error('Erreur !', { description: `Une erreur est survenue, vérifiez le formulaire.` });
                }
            },
        });
    };

    const setVariantImage = (index: number, image: File | string | null) => {
        const updated = [...data.variants];
        updated[index].image = image;
        form.setValue(`variants.${index}.image`, image);
        setData("variants", updated);
    };

    return (
        <AppLayout breadcrumbs={isMobile ? [] : breadcrumbs}>
            <Head title="Ajouter un produit" />
            <div className="p-4 sm:p-6 lg:p-8 ">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Créer un nouveau produit
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Remplissez les informations générales et ajoutez les variantes ci necessaire.
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid grid-cols-1 lg:grid-cols-4 md:space-x-4 space-y-4"
                    >
                        <div className="md:col-span-2 lg:col-span-3 space-y-4">
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-1">
                                    Informations générales
                                </h2>
                                <FormFieldWrapper
                                    control={control}
                                    name="name"
                                    label="Nom *"
                                    placeholder="Ex: Oeuf bio"
                                    onValueChange={(value) => setData("name", value)}
                                    onFocus={() => clearErrors('name')}
                                    error={errors.name}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name="description"
                                    label="Description *"
                                    error={errors.description}
                                    renderCustom={({ value, onChange }) => (
                                        <div className="border rounded-md">
                                            {editor && <TiptapToolbar editor={editor} />}
                                            <div className="min-h-[150px] p-2">
                                                <EditorContent editor={editor} />
                                            </div>
                                        </div>
                                    )}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name="images"
                                    label="Images"
                                    error={errors.images}
                                    renderCustom={({ value, onChange }) => (
                                        <ProductImagesUploader
                                            images={imagePreviews}
                                            defaultImage={defaultImage}
                                            onChange={(newImages) => {
                                                setImagePreviews(newImages);

                                                const files = newImages
                                                    .map(i => i.file)
                                                    .filter((f): f is File => f !== null);

                                                onChange(files);
                                                setData("images", files);
                                            }}
                                            onDefaultChange={(id) => {
                                                setDefaultImage(id);
                                                form.setValue("default_image", id);
                                                setData("default_image", id);
                                            }}
                                            onRemove={(id) => {
                                                const updated = imagePreviews.filter(i => i.id !== id);
                                                setImagePreviews(updated);

                                                if (defaultImage === id) {
                                                    setDefaultImage(null);
                                                    form.setValue("default_image", null);
                                                    setData("default_image", null);
                                                }

                                                const files = updated
                                                    .map(i => i.file)
                                                    .filter((file): file is File => file !== null);

                                                onChange(files);
                                                setData("images", files);
                                            }}
                                        />
                                    )}
                                />
                            </Card>
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-1">
                                    Emballage
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                    <FormFieldWrapper
                                        control={control}
                                        name="length"
                                        label="Longueur (cm)"
                                        type="number"
                                        placeholder="20"
                                        onValueChange={(value) => setData("length", value)}
                                        onFocus={() => clearErrors('length')}
                                        error={errors.length}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="width"
                                        label="Largeur (cm)"
                                        type="number"
                                        placeholder="20"
                                        onValueChange={(value) => setData("width", value)}
                                        onFocus={() => clearErrors('width')}
                                        error={errors.width}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="height"
                                        label="Hauteur (cm)"
                                        type="number"
                                        placeholder="20"
                                        onValueChange={(value) => setData("height", value)}
                                        onFocus={() => clearErrors('height')}
                                        error={errors.height}
                                    />
                                    <FormFieldWrapper
                                        control={control}
                                        name="weight"
                                        label="Poids (à vide) (kg)"
                                        type="number"
                                        placeholder="20"
                                        onValueChange={(value) => setData("weight", value)}
                                        onFocus={() => clearErrors('weight')}
                                        error={errors.weight}
                                    />
                                </div>
                            </Card>

                            {/* ATTRIBUTES & VARIANTS SECTION */}
                            <Card className="p-4 space-y-4 shadow-none">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Attributs</h2>
                                    <p className="text-sm text-muted-foreground mb-4">Ajoutez des options comme la taille ou la couleur pour générer des variantes.</p>

                                    <Accordion
                                        type="multiple"
                                        className="space-y-2 w-full"
                                    >
                                        {attributeFields.map((attribute, aIndex) => (
                                            <AttributeForm
                                                key={attribute.id}
                                                control={control}
                                                aIndex={aIndex}
                                                removeAttribute={removeAttribute}
                                                errors={errors as any}
                                                postData={data}
                                                setData={setData}
                                                watch={watch}
                                            />
                                        ))}
                                    </Accordion>

                                    {errors.attributes && (
                                        <p className="text-red-500 text-sm mt-2">{errors.attributes}</p>
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4 flex items-center gap-2"
                                        onClick={() => addAttribute({ name: "", options: [] })}
                                    >
                                        <PlusCircle className="h-4 w-4" /> Ajouter un attribut
                                    </Button>
                                </div>

                                {/* GENERATED VARIANTS TABLE */}
                                {variantFields.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <h3 className="text-lg font-medium mb-3">Variantes générées ({variantFields.length})</h3>
                                        <div className="border rounded-md overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[80px]">Défaut</TableHead>
                                                        <TableHead className="w-[100px]">Image</TableHead>
                                                        <TableHead>Variante</TableHead>
                                                        <TableHead className="w-[150px]">Prix</TableHead>
                                                        <TableHead className="w-[150px]">Prix Barré</TableHead>
                                                        <TableHead className="w-[150px]">Quantité</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {variantFields.map((variant, index) => (
                                                        <TableRow key={variant.id}>
                                                            <TableCell>
                                                                <RadioGroup
                                                                    value={String(variantFields[index].is_default)}
                                                                    onValueChange={() => {
                                                                        const updated = data.variants.map((v, i) => ({
                                                                            ...v,
                                                                            is_default: i === index, // only this one becomes default
                                                                        }));
                                                                        replaceVariants(updated);
                                                                        setData("variants", updated);
                                                                    }}
                                                                >
                                                                    <RadioGroupItem value="true" id={`default-${index}`} />
                                                                </RadioGroup>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div
                                                                    className={cn(
                                                                        "border-2 border-dashed rounded-md text-center cursor-pointer",
                                                                        "hover:bg-muted transition",
                                                                        "flex flex-col items-center justify-center gap-1",
                                                                        "min-h-[64px] w-[64px]"
                                                                    )}
                                                                    onDragOver={(e) => e.preventDefault()}
                                                                    onDrop={(e) => {
                                                                        e.preventDefault();
                                                                        const file = e.dataTransfer.files?.[0] ?? null;
                                                                        if (file) {
                                                                            const updated = [...data.variants];
                                                                            updated[index].image = file;
                                                                            form.setValue(`variants.${index}.image`, file);
                                                                            setData("variants", updated);
                                                                        }
                                                                    }}
                                                                    onClick={() => document.getElementById(`variant-image-${index}`)?.click()}
                                                                >
                                                                    {(() => {
                                                                        const currentImage = watch(`variants.${index}.image`);

                                                                        if (currentImage instanceof File) {
                                                                            return (
                                                                                <div className="relative">
                                                                                    <img
                                                                                        src={URL.createObjectURL(currentImage)}
                                                                                        className="w-16 h-16 object-cover rounded"
                                                                                    />
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="destructive"
                                                                                        size="icon"
                                                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setVariantImage(index, null);
                                                                                        }}
                                                                                    >
                                                                                        ✕
                                                                                    </Button>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        if (typeof currentImage === "string" && currentImage.length > 0) {
                                                                            return (
                                                                                <div className="relative">
                                                                                    <img
                                                                                        src={currentImage}
                                                                                        className="w-16 h-16 object-cover rounded"
                                                                                    />
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="destructive"
                                                                                        size="icon"
                                                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setVariantImage(index, null);
                                                                                        }}
                                                                                    >
                                                                                        ✕
                                                                                    </Button>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <div className="text-xs text-muted-foreground">
                                                                                <Image className="w-5 h-5" />
                                                                            </div>
                                                                        );
                                                                    })()}

                                                                    <input
                                                                        type="file"
                                                                        id={`variant-image-${index}`}
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0] ?? null;
                                                                            setVariantImage(index, file);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </TableCell>

                                                            <TableCell className="font-medium">
                                                                {watch(`variants.${index}.name`)}
                                                                <input
                                                                    type="hidden"
                                                                    {...form.register(`variants.${index}.name`)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormFieldWrapper
                                                                    control={control}
                                                                    noLabel={true}
                                                                    name={`variants.${index}.price`}
                                                                    onValueChange={(value) => {
                                                                        const updatedVariants = [...data.variants];
                                                                        updatedVariants[index] = {
                                                                            ...updatedVariants[index],
                                                                            price: value,
                                                                        };
                                                                        setData("variants", updatedVariants);
                                                                    }}
                                                                    type="number"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormFieldWrapper
                                                                    control={control}
                                                                    noLabel={true}
                                                                    name={`variants.${index}.compare_at_price`}
                                                                    placeholder="Optionnel"
                                                                    onValueChange={(value) => {
                                                                        const updatedVariants = [...data.variants];
                                                                        updatedVariants[index] = {
                                                                            ...updatedVariants[index],
                                                                            compare_at_price: value,
                                                                        };
                                                                        setData("variants", updatedVariants);
                                                                    }}
                                                                    type="number"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormFieldWrapper
                                                                    control={control}
                                                                    noLabel={true}
                                                                    name={`variants.${index}.quantity`}
                                                                    onValueChange={value => {
                                                                        const updatedVariants = [...data.variants];
                                                                        updatedVariants[index] = {
                                                                            ...updatedVariants[index],
                                                                            quantity: value,
                                                                        };
                                                                        setData("variants", updatedVariants);
                                                                    }}
                                                                    type="number"
                                                                    placeholder="Qte"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        <div className="md:col-span-2 lg:col-span-1 space-y-4">
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-1">Annexe</h2>

                                {/* Hide Global Price/Qty if Variants Exist? Optional, usually good UX */}
                                {variantFields.length === 0 && (
                                    <>
                                        <FormFieldWrapper
                                            control={control}
                                            name="price"
                                            label="Prix TTC"
                                            type="number"
                                            placeholder="2000"
                                            onValueChange={(value) => setData("price", value)}
                                            onFocus={() => clearErrors('price')}
                                            error={errors.price}
                                        />
                                        <FormFieldWrapper
                                            control={control}
                                            name="compare_at_price"
                                            label="Prix d'origine (Barré)"
                                            type="number"
                                            placeholder="Laisser vide si pas de remise"
                                            onValueChange={(value) => setData("compare_at_price", value)}
                                            error={errors.compare_at_price}
                                        />
                                        <FormFieldWrapper
                                            control={control}
                                            name="quantity"
                                            label="Quantité"
                                            type="number"
                                            placeholder="0"
                                            onValueChange={(value) => setData("quantity", value)}
                                            onFocus={() => clearErrors('quantity')}
                                            error={errors.quantity}
                                        />
                                    </>
                                )}
                                {variantFields.length > 0 && (
                                    <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-md mb-2">
                                        Le prix et la quantité sont gérés par variante.
                                    </div>
                                )}
                                <FormFieldWrapper
                                    control={control}
                                    name="origin"
                                    label="Origine"
                                    placeholder="Ex: Ferme MontView"
                                    onValueChange={(value) => setData("origin", value)}
                                    onFocus={() => clearErrors('origin')}
                                    error={errors.origin}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name="category_ids"
                                    label="Catégories"
                                    error={errors.category_ids}
                                    renderCustom={({ value, onChange }) => (
                                        <CategoriesMultiSelect
                                            categories={categories}
                                            value={value || []}
                                            onChange={(updated) => {
                                                onChange(updated);
                                                setData("category_ids", updated);
                                            }}
                                        />
                                    )}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name="status"
                                    label="Statut *"
                                    type="select"
                                    placeholder="Choisir la statut"
                                    options={productStatus}
                                    onOpenChange={() => clearErrors('status')}
                                    onValueChange={(value) => setData("status", value)}
                                    error={errors.status}
                                />
                            </Card>
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-1">
                                    SEO
                                </h2>
                                <FormFieldWrapper
                                    control={control}
                                    name="tags"
                                    label="Mots Clés"
                                    error={errors.tags}
                                    renderCustom={({ value, onChange }) => (
                                        <TagsInput
                                            value={value || []}
                                            onChange={(tags) => {
                                                onChange(tags);
                                                setData("tags", tags);
                                            }}
                                            placeholder="Ex: Oeuf, Poule..."
                                        />
                                    )}
                                />
                                <FormFieldWrapper
                                    control={control}
                                    name="meta_description"
                                    label="Meta description"
                                    type="textarea"
                                    placeholder="courte description..."
                                    onValueChange={(value) => setData("meta_description", value)}
                                    error={errors.meta_description}
                                />
                            </Card>
                        </div>
                        <Button type="submit" disabled={processing} className="mt-6 w-full">
                            {processing ? "Enregistrement..." : "Créer le produit"}
                        </Button>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
