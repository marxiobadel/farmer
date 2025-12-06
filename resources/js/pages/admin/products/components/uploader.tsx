import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Star, StarOff, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImagePreview {
    file: File;
    url: string;
    id: string;
}

interface Props {
    images: ImagePreview[];
    defaultImage: string | null;
    onChange: (images: ImagePreview[]) => void;
    onDefaultChange: (id: string) => void;
    onRemove: (id: string) => void;
}

export default function ProductImagesUploader({
    images,
    defaultImage,
    onChange,
    onDefaultChange,
    onRemove,
}: Props) {
    // Handle drop
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const mapped = acceptedFiles.map((file) => ({
                file,
                url: URL.createObjectURL(file),
                id: `${file.name}-${crypto.randomUUID()}`,
            }));

            onChange([...images, ...mapped]);
        },
        [images, onChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] },
        onDrop,
        multiple: true,
    });

    return (
        <div className="space-y-5">

            {/* DROPZONE */}
            <div
                {...getRootProps()}
                className={cn(
                    "w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition",
                    "bg-gray-50 dark:bg-gray-900",
                    isDragActive
                        ? "border-primary/60 bg-primary/10"
                        : "border-gray-300 dark:border-gray-700 hover:border-primary/40"
                )}
            >
                <input {...getInputProps()} />

                <UploadCloud className="w-10 h-10 mb-2 text-gray-500" />

                <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Glissez-déposez vos images ici
                </p>

                <p className="text-sm text-gray-500">
                    ou cliquez pour sélectionner des fichiers
                </p>
            </div>

            {/* IMAGES LIST */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="relative rounded-lg overflow-hidden border bg-white dark:bg-gray-900"
                        >
                            {/* Image */}
                            <img
                                src={img.url}
                                alt="image preview"
                                className="w-full h-40 object-cover"
                            />

                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={() => onRemove(img.id)}
                                className="absolute top-2 right-2 bg-white text-red-600 rounded-full p-1 shadow hover:scale-110 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Default Button */}
                            <button
                                type="button"
                                onClick={() => onDefaultChange(img.id)}
                                className={cn(
                                    "absolute bottom-2 left-2 p-1 rounded-full shadow transition bg-white",
                                    defaultImage === img.id
                                        ? "text-amber-600"
                                        : "text-gray-400 hover:text-gray-700"
                                )}
                            >
                                {defaultImage === img.id ? (
                                    <Star className="w-5 h-5" />
                                ) : (
                                    <StarOff className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
