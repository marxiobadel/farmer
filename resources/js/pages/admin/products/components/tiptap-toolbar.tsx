import { Button } from "@/components/ui/button";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    GripHorizontal,
    Italic,
    LinkIcon,
    Quote,
    Strikethrough,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fonts } from "@/data";
import type { Editor } from "@tiptap/react";

interface Props {
    editor: Editor | null;
}

export default function TiptapToolbar({ editor }: Props) {
    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-2 border-b p-2">

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-gray-200" : ""}
            >
                <Bold className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-gray-200" : ""}
            >
                <Italic className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive("strike") ? "bg-gray-200" : ""}
            >
                <Strikethrough className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={editor.isActive("codeBlock") ? "bg-gray-200" : ""}
            >
                <Code className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
            >
                <Quote className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <GripHorizontal className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().setHardBreak().run()}
            >
                ↵
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
                <AlignLeft className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
                <AlignCenter className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
                <AlignRight className="w-4 h-4" />
            </Button>

            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                    const url = prompt("URL du lien");
                    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }}
            >
                <LinkIcon className="w-4 h-4" />
            </Button>

            <Popover>
                <PopoverTrigger asChild>
                    <Button size="sm" variant="ghost">Font</Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col gap-2 p-2 w-40">
                    {fonts.map((font) => (
                        <button
                            key={font}
                            className="text-left px-2 py-1 hover:bg-gray-100 rounded"
                            style={{ fontFamily: font }}
                            onClick={() => editor.chain().focus().setFontFamily(font).run()}
                        >
                            {font}
                        </button>
                    ))}
                </PopoverContent>
            </Popover>
        </div>
    );
}
