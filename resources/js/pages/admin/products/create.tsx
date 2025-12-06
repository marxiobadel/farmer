import { useEventBus } from "@/context/event-bus-context";
import { useIsMobile } from "@/hooks/use-mobile";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import admin from "@/routes/admin";
import type { BreadcrumbItem, Category } from "@/types";
import { Head, useForm as useInertiaForm } from "@inertiajs/react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontFamily } from "@tiptap/extension-text-style";
import TiptapToolbar from "./components/tiptap-toolbar";
import { useState } from "react";
import ProductImagesUploader, { ImagePreview } from "./components/uploader";
import { TagsInput } from "@/components/tags-input";
import { productStatus } from "@/data";
import CategoriesMultiSelect from "./components/multiselect";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Tableau de bord", href: dashboard().url },
    { title: "Liste des produits", href: admin.products.index().url },
    { title: "Ajouter un produit", href: '#' },
];

export interface ProductInput {
    name: string;
    description: string;
    meta_description?: string;
    price?: string;
    quantity: string;
    category_ids: string[];
    status: "draft" | "published" | "archived";
    tags?: string[];
    images: File[];
    default_image: string | null;
}

export type ProductFormData = ProductInput & Record<string, any>;

interface PageProps {
    categories: Category[];
}

export default function Create({ categories }: PageProps) {
    const { emit } = useEventBus();
    const isMobile = useIsMobile();

    const initialInputs: ProductInput = {
        name: "",
        description: "",
        meta_description: "",
        price: "",
        quantity: "0",
        category_ids: [],
        status: "draft",
        tags: [],
        images: [],
        default_image: null,
    };

    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const [defaultImage, setDefaultImage] = useState<string | null>(null);

    const form = useForm<ProductInput>({ defaultValues: { ...initialInputs } });
    const { control, handleSubmit, watch } = form;

    const {
        post,
        processing,
        errors,
        setData,
        data,
        clearErrors,
    } = useInertiaForm<ProductFormData>({
        ...initialInputs
    });

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
            onSuccess: () => emit('product.saved', `Produit ajouté avec succès !`, { persist: true }),
        });
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
                        Remplissez les informations générales et ajoutez les
                        variantes ci necessaire.
                    </p>
                </div>
                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid grid-cols-1 lg:grid-cols-4 md:space-x-4 space-y-4"
                    >
                        <div className="md:col-span-2 lg:col-span-3 space-y-4">
                            <Card className="p-4 space-y-2 shadow-none">
                                <h2 className="text-xl font-semibold mb-2">
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
                                            <div className="min-h-[200px] p-2">
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

                                                onChange(newImages.map(i => i.file));

                                                setData("images", newImages.map(i => i.file));
                                            }}
                                            onDefaultChange={(id) => {
                                                setDefaultImage(id);
                                                form.setValue("default_image", id);
                                                setData("default_image", id);
                                            }}
                                            onRemove={(id) => {
                                                const updated = imagePreviews.filter(i => i.id !== id);
                                                setImagePreviews(updated);

                                                // if removed the default image → reset
                                                if (defaultImage === id) {
                                                    setDefaultImage(null);
                                                    form.setValue("default_image", null);
                                                    setData("default_image", null);
                                                }

                                                onChange(updated.map(i => i.file));
                                                setData("images", updated.map(i => i.file));
                                            }}
                                        />
                                    )}
                                />
                            </Card>
                            <Card className="p-4 space-y-2 shadow-none">
                                <h2 className="text-xl font-semibold mb-2">
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
                            <Card className="p-4 space-y-2 shadow-none">
                                <h2 className="text-xl font-semibold mb-2">
                                    Variantes
                                </h2>
                            </Card>
                        </div>
                        <div className="md:col-span-2 lg:col-span-1">
                            <Card className="p-4 shadow-none">
                                <h2 className="text-xl font-semibold mb-2">Annexe</h2>
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
                                    label="Quantité en stock"
                                    type="number"
                                    placeholder="0"
                                    onValueChange={(value) => setData("quantity", value)}
                                    onFocus={() => clearErrors('quantity')}
                                    error={errors.quantity}
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
