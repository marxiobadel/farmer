import { useEventBus } from "@/context/event-bus-context";
import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import type { Category, Product, ProductImage } from "@/types";
import { Head, useForm as useInertiaForm } from "@inertiajs/react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { AttributeInput, ProductInput, VariantInput } from "./create";
import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { FontFamily, TextStyle } from "@tiptap/extension-text-style";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import TiptapToolbar from "./components/tiptap-toolbar";
import ProductImagesUploader, { ImagePreview } from "./components/uploader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Image, PlusCircle } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import AttributeForm from "./components/attribute-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { TagsInput } from "@/components/tags-input";
import { productStatus } from "@/data";
import CategoriesMultiSelect from "./components/multiselect";

const breadcrumbs = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Produits", href: admin.products.index().url },
    { title: "Modifier un produit", href: "#" },
];

interface EditProps {
    product: Product;
    categories: Category[];
}

export default function Edit({ product, categories }: EditProps) {
    const isMobile = useIsMobile();
    const { emit } = useEventBus();

    const initialInputs: ProductInput = {
        name: product.name,
        description: product.description || "",
        meta_description: product.short_description || "",
        price: String(product.base_price ?? ""),
        origin: product.origin ?? "",
        quantity: String(product.quantity ?? "0"),
        weight: String(product.weight ?? ""),
        height: String(product.height ?? ""),
        width: String(product.width ?? ""),
        length: String(product.length ?? ""),
        category_ids: product.categories.map((c) => String(c.id)),
        status: product.status as any,
        tags: Array.isArray(product.tags) ? product.tags : [],
        attributes: product.attributes.map((attr) => ({
            name: attr.name,
            options: attr.options.map((o) => ({ name: o.name })),
        })),
        variants: product.variants.map((v) => ({
            name: v.options.map((o) => o.option).join(" / "),
            price: String(v.price),
            quantity: String(v.quantity),
            is_default: !!v.is_default,
            image: v.image,
        })),
        images: [],
        default_image: product.default_image,
    };

    const form = useForm<ProductInput>({
        defaultValues: initialInputs,
    });

    const { control, handleSubmit, watch } = form;

    const {
        post,
        processing,
        errors,
        data,
        setData,
        clearErrors,
        transform
    } = useInertiaForm<ProductInput>(initialInputs);

    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [defaultImage, setDefaultImage] = useState<string | null>(null);
    const [imageIds, setImageIds] = useState<string[]>([]);

    const {
        fields: attributeFields,
        append: addAttribute,
        remove: removeAttribute,
    } = useFieldArray({ control, name: "attributes" });

    // VARIANTS
    const { fields: variantFields, replace: replaceVariants } = useFieldArray({ control, name: "variants" });

    const watchedAttributes = useWatch({ control, name: "attributes" });

    const cartesianProduct = useCallback((args: any[][]) => {
        const result: any[][] = [];
        const max = args.length - 1;

        function helper(arr: any[], i: number) {
            for (let j = 0; j < args[i].length; j++) {
                const copy = [...arr, args[i][j]];
                if (i === max) result.push(copy);
                else helper(copy, i + 1);
            }
        }

        helper([], 0);
        return result;
    }, []);

    useEffect(() => {
        setImagePreviews([...product.images.map((img: ProductImage) => ({ id: img.id.toString(), file: null, url: img.url }))]);

        setDefaultImage(String(product.default_image_id));
    }, []);

    useEffect(() => {
        if (!imagePreviews) return;

        const ids = imagePreviews
            .filter(img => typeof img.id === "string" && img.file === null)
            // Keep only existing images (file === null)
            .map(img => img.id);

        setImageIds(ids);
    }, [imagePreviews]);

   useEffect(() => {
        const attributes = (watchedAttributes || []) as AttributeInput[];

        const validAttributes = attributes.filter(
            (attr) =>
                attr.name &&
                attr.options?.length &&
                attr.options.some((o) => o.name)
        );

        // Si plus d'attributs valides, on vide les variantes
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

        const newVariants = combos.map((combo, index) => { // Ajout de l'index ici
            const variantName = combo.join(" / ");

            // 1. On cherche d'abord une correspondance exacte par nom (cas standard)
            let existing = currentVariants.find((v) => v.name === variantName);

            // 2. CORRECTION CRITIQUE : Fallback par Index
            // Si on ne trouve pas par nom, MAIS que le nombre de variantes n'a pas changé,
            // on suppose que c'est un renommage. On garde donc les données de la variante au même index.
            if (!existing && combos.length === currentVariants.length) {
                existing = currentVariants[index];
            }

            return {
                name: variantName,
                // On récupère les valeurs existantes (trouvées par nom OU par index)
                price: existing?.price ?? form.getValues("price") ?? "",
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
        JSON.stringify(watchedAttributes),
        cartesianProduct
    ]);

    const editor = useEditor({
        content: product.description ?? "",
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TextStyle,
            FontFamily,
        ],
        onUpdate: ({ editor }) => setData("description", editor.getHTML()),
    });

    const onSubmit = () => {
        transform((data) => {
            const normalizedVariants = (data.variants || []).map((v) => ({
                ...v,
                // CORRECTION: Si c'est un fichier (nouveau), on l'envoie.
                // Si c'est une string (URL existante) ou null, on renvoie "KEEP" ou la valeur telle quelle
                // pour que le backend sache qu'il ne doit pas attendre de fichier mais récupérer l'ancien.
                image: v.image instanceof File ? v.image : (typeof v.image === 'string' ? 'keep' : null),
            }));

            return {
                ...data,
                variants: normalizedVariants,
                image_ids: imageIds,
                _method: "PUT",
            };
        });

        post(admin.products.update(product.slug).url, {
            preserveState: true,
            forceFormData: true,
            preserveScroll: 'errors',
            onSuccess: () => emit("product.saved", "Produit modifié avec succès !"),
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
            <Head title={`Modifier : ${product.name}`} />
            <div className="p-4 sm:p-6 lg:p-8 ">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Modifier un produit
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Revoir les informations générales et les variantes ci necessaire.
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
                                            <Table className={cn({ 'w-[600px]': isMobile })}>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[80px]">Défaut</TableHead>
                                                        <TableHead className="w-[100px]">Image</TableHead>
                                                        <TableHead>Variante</TableHead>
                                                        <TableHead className="w-[150px]">Prix</TableHead>
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
                            {processing ? "Enregistrement..." : "Mettre à jour le produit"}
                        </Button>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
