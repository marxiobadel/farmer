import { useRef } from "react";
import { X } from "lucide-react";

interface ImageUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
    error?: string;
}

export default function ImageUpload({ value, onChange, error }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onChange(file);
    };

    return (
        <div className="flex flex-col space-y-2 pt-1">
            {/* Dropzone */}
            <div
                className={`flex items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition hover:border-primary/70 ${error ? "border-red-500" : "border-muted"
                    }`}
                onClick={() => inputRef.current?.click()}
            >
                {value ? (
                    <div className="relative">
                        <img
                            src={URL.createObjectURL(value)}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground">Cliquez ou déposez une image ici</span>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}
