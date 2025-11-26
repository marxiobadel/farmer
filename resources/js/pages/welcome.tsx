import React, { useState, useMemo } from "react";

/* ----------------------------------------------------------
 * Types
 * -------------------------------------------------------- */

export type AttributeType = "select" | "radio" | "image" | "color" | "text";

export interface AttributeValue {
    id: string;
    valeur: string;
    meta?: {
        color?: string;
        image?: string;
        [key: string]: any;
    };
}

export interface Attribute {
    id: string;
    nom: string;
    type: AttributeType;
    valeurs?: AttributeValue[];
}

export interface Declinaison {
    id: string;
    name: string;
    keys: string;
    parts: Array<{
        attributId: string;
        attributNom: string;
        valeurId: string;
        valeur: string;
        meta?: Record<string, any>;
    }>;
    sku?: string;
    prix?: number | null;
    stock?: number;
    image?: string | null;
}

export interface VariationBuilderAdminProps {
    productId?: number | null;
    initialAttributes?: Attribute[];
    initialDeclinaisons?: Declinaison[];
    onSave?: (items: Declinaison[]) => void;
}

/* ----------------------------------------------------------
 * Utils
 * -------------------------------------------------------- */

const DEFAULT_ATTRIBUTE_TYPES: AttributeType[] = [
    "select",
    "radio",
    "image",
    "color",
    "text"
];

function uid(prefix = "id"): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function cartesianProduct<T>(arrays: T[][]): T[][] {
    if (!arrays.length) return [];
    return arrays.reduce<T[][]>(
        (acc, curr) => {
            const res: T[][] = [];
            acc.forEach((a) => {
                curr.forEach((c) => {
                    res.push([...a, c]);
                });
            });
            return res;
        },
        [[]]
    );
}

function downloadCSV(filename: string, rows: any[]) {
    if (!rows.length) return;

    const csv = [
        Object.keys(rows[0]).join(","),
        ...rows.map((r) =>
            Object.values(r)
                .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
                .join(",")
        )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ----------------------------------------------------------
 * MAIN COMPONENT
 * -------------------------------------------------------- */

export default function VariationBuilderAdmin({
    productId = null,
    initialAttributes = [],
    initialDeclinaisons = [],
    onSave
}: VariationBuilderAdminProps) {
    /* ------------------------------------------
     * 1 — Pool d'attributs
     * ---------------------------------------- */
    const [attributesPool, setAttributesPool] = useState<Attribute[]>(() => {
        if (initialAttributes.length) return initialAttributes.map((a) => ({ ...a }));

        return [
            { id: uid("attr"), nom: "Taille", type: "select" },
            { id: uid("attr"), nom: "Conditionnement", type: "select" },
            { id: uid("attr"), nom: "Race", type: "radio" }
        ];
    });

    /* ------------------------------------------
     * 2 — Attributs activés sur le produit
     * ---------------------------------------- */
    const [productAttributes, setProductAttributes] = useState<Attribute[]>(() => {
        const sample = attributesPool
            .slice(0, 2)
            .map((attr) => ({ ...attr, valeurs: [] as AttributeValue[] }));
        return sample;
    });

    /* ------------------------------------------
     * 3 — Déclinaisons (variantes)
     * ---------------------------------------- */
    const [declinaisons, setDeclinaisons] = useState<Declinaison[]>(
        () => initialDeclinaisons.map((d) => ({ ...d }))
    );

    /* UI states */
    const [newAttrName, setNewAttrName] = useState("");
    const [newAttrType, setNewAttrType] = useState<AttributeType>("select");

    /* ----------------------------------------------------------
     * 4 — Génération des combinaisons cartésiennes
     * -------------------------------------------------------- */
    const generatedCombinations = useMemo(() => {
        const lists = productAttributes
            .filter((a) => a.valeurs && a.valeurs.length)
            .map((a) =>
                a.valeurs!.map((v) => ({
                    attributId: a.id,
                    attributNom: a.nom,
                    valeurId: v.id,
                    valeur: v.valeur,
                    meta: v.meta || {}
                }))
            );

        if (!lists.length) return [];

        const product = cartesianProduct(lists);

        return product.map((combo) => {
            const name = combo.map((c) => `${c.attributNom}:${c.valeur}`).join(" | ");
            const keys = combo
                .map((c) => `${c.attributId}=${c.valeurId}`)
                .join(";");

            return {
                id: uid("combo"),
                name,
                keys,
                parts: combo
            };
        });
    }, [productAttributes]);

    /* ----------------------------------------------------------
     * 5 — Fusion combinaisons générées + valeurs existantes
     * -------------------------------------------------------- */
    const merged = useMemo<Declinaison[]>(() => {
        if (!generatedCombinations.length) return declinaisons;

        const mapByKeys = new Map(declinaisons.map((d) => [d.keys, d]));

        return generatedCombinations.map((g) => {
            const existing = mapByKeys.get(g.keys);
            return existing
                ? { ...g, ...existing }
                : {
                    ...g,
                    sku: "",
                    prix: null,
                    stock: 0,
                    image: null
                };
        });
    }, [generatedCombinations, declinaisons]);

    React.useEffect(() => {
        setDeclinaisons(merged);
    }, [merged.length]);

    /* ----------------------------------------------------------
     * 6 — CRUD Attributs
     * -------------------------------------------------------- */

    function addAttributeToPool() {
        if (!newAttrName.trim()) return;
        const attr: Attribute = {
            id: uid("attr"),
            nom: newAttrName.trim(),
            type: newAttrType
        };
        setAttributesPool((prev) => [...prev, attr]);
        setNewAttrName("");
        setNewAttrType("select");
    }

    function activateAttributeForProduct(attrId: string) {
        const attr = attributesPool.find((a) => a.id === attrId);
        if (!attr) return;
        setProductAttributes((prev) => {
            if (prev.some((p) => p.id === attr.id)) return prev;
            return [...prev, { ...attr, valeurs: [] }];
        });
    }

    function deactivateAttributeForProduct(attrId: string) {
        setProductAttributes((prev) => prev.filter((a) => a.id !== attrId));
    }

    function addValueToAttribute(attrId: string, valeur: string, meta: any = {}) {
        setProductAttributes((prev) =>
            prev.map((a) => {
                if (a.id !== attrId) return a;
                const v: AttributeValue = { id: uid("val"), valeur, meta };
                return { ...a, valeurs: [...(a.valeurs || []), v] };
            })
        );
    }

    function removeValueFromAttribute(attrId: string, valueId: string) {
        setProductAttributes((prev) =>
            prev.map((a) =>
                a.id !== attrId
                    ? a
                    : { ...a, valeurs: a.valeurs!.filter((v) => v.id !== valueId) }
            )
        );
    }

    /* ----------------------------------------------------------
     * 7 — Déclinaisons CRUD
     * -------------------------------------------------------- */

    function setDeclinaisonField(
        keys: string,
        field: keyof Declinaison,
        value: any
    ) {
        setDeclinaisons((prev) =>
            prev.map((d) => (d.keys === keys ? { ...d, [field]: value } : d))
        );
    }

    function bulkUpdate(field: keyof Declinaison, value: any) {
        setDeclinaisons((prev) => prev.map((d) => ({ ...d, [field]: value })));
    }

    function saveAll() {
        if (onSave) onSave(declinaisons);
        else {
            console.log("Declinaisons to save", declinaisons);
            alert("Déclinaisons prêtes (voir console)");
        }
    }

    /* ----------------------------------------------------------
     * RENDER
     * -------------------------------------------------------- */

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* HEADER */}
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Variation Builder — Admin</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => downloadCSV("declinaisons.csv", declinaisons)}
                            className="px-3 py-2 rounded bg-white border"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={saveAll}
                            className="px-3 py-2 rounded bg-blue-600 text-white"
                        >
                            Enregistrer
                        </button>
                    </div>
                </header>

                {/* ATTRIBUTES */}
                <section className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 bg-white p-4 rounded shadow-sm">
                        <h2 className="font-medium mb-3">Attributs disponibles</h2>

                        <div className="space-y-2 mb-4">
                            {attributesPool.map((a) => (
                                <div
                                    key={a.id}
                                    className="flex items-center justify-between p-2 border rounded"
                                >
                                    <div>
                                        <div className="text-sm font-medium">{a.nom}</div>
                                        <div className="text-xs text-gray-500">{a.type}</div>
                                    </div>
                                    <div>
                                        {productAttributes.some((pa) => pa.id === a.id) ? (
                                            <button
                                                onClick={() => deactivateAttributeForProduct(a.id)}
                                                className="text-sm px-2 py-1 border rounded"
                                            >
                                                Désactiver
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => activateAttributeForProduct(a.id)}
                                                className="text-sm px-2 py-1 bg-green-500 text-white rounded"
                                            >
                                                Activer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add attribute */}
                        <div className="pt-3 border-t">
                            <h3 className="text-sm font-medium mb-2">Créer un attribut</h3>
                            <div className="flex flex-col gap-2">
                                <input
                                    className="border px-2 py-1 rounded"
                                    placeholder="Nom"
                                    value={newAttrName}
                                    onChange={(e) => setNewAttrName(e.target.value)}
                                />
                                <select
                                    className="border px-2 py-1 rounded"
                                    value={newAttrType}
                                    onChange={(e) =>
                                        setNewAttrType(e.target.value as AttributeType)
                                    }
                                >
                                    {DEFAULT_ATTRIBUTE_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={addAttributeToPool}
                                    className="mt-1 px-3 py-2 bg-indigo-600 text-white rounded"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCT ATTRIBUTES */}
                    <div className="col-span-2 bg-white p-4 rounded shadow-sm">
                        <h2 className="font-medium mb-3">Attributs du produit</h2>

                        <div className="space-y-4">
                            {productAttributes.map((attr) => (
                                <div key={attr.id} className="border p-3 rounded">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-lg font-semibold">
                                                {attr.nom}{" "}
                                                <span className="text-xs text-gray-500">
                                                    ({attr.type})
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">Valeurs</div>
                                        </div>

                                        <button
                                            onClick={() => deactivateAttributeForProduct(attr.id)}
                                            className="px-2 py-1 border rounded"
                                        >
                                            Retirer
                                        </button>
                                    </div>

                                    <div className="mt-3">
                                        <ValueListEditor
                                            attr={attr}
                                            onAdd={(val, meta) =>
                                                addValueToAttribute(attr.id, val, meta)
                                            }
                                            onRemove={(valueId) =>
                                                removeValueFromAttribute(attr.id, valueId)
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* DECLINAISONS */}
                <section className="bg-white p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-medium">Déclinaisons générées</h2>

                        <div className="flex gap-2 items-center">
                            <input
                                placeholder="Prix commun"
                                type="number"
                                onChange={(e) =>
                                    bulkUpdate("prix", Number(e.target.value) || null)
                                }
                                className="border px-2 py-1 rounded w-36"
                            />

                            <input
                                placeholder="Stock commun"
                                type="number"
                                onChange={(e) => bulkUpdate("stock", Number(e.target.value))}
                                className="border px-2 py-1 rounded w-36"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm table-auto border-collapse">
                            <thead>
                                <tr className="text-left">
                                    <th className="border-b p-2">#</th>
                                    <th className="border-b p-2">Détails</th>
                                    <th className="border-b p-2">SKU</th>
                                    <th className="border-b p-2">Prix</th>
                                    <th className="border-b p-2">Stock</th>
                                    <th className="border-b p-2">Image</th>
                                </tr>
                            </thead>

                            <tbody>
                                {declinaisons.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-gray-500">
                                            Aucune déclinaison — ajoute des valeurs aux attributs.
                                        </td>
                                    </tr>
                                )}

                                {declinaisons.map((d, idx) => (
                                    <tr key={d.keys} className="border-t">
                                        <td className="p-2 align-top">{idx + 1}</td>
                                        <td className="p-2 align-top">{d.name}</td>

                                        {/* SKU */}
                                        <td className="p-2 align-top">
                                            <input
                                                className="border px-2 py-1 rounded w-40"
                                                value={d.sku ?? ""}
                                                onChange={(e) =>
                                                    setDeclinaisonField(d.keys, "sku", e.target.value)
                                                }
                                            />
                                        </td>

                                        {/* PRIX */}
                                        <td className="p-2 align-top">
                                            <input
                                                type="number"
                                                className="border px-2 py-1 rounded w-28"
                                                value={d.prix ?? ""}
                                                onChange={(e) =>
                                                    setDeclinaisonField(
                                                        d.keys,
                                                        "prix",
                                                        e.target.value ? Number(e.target.value) : null
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* STOCK */}
                                        <td className="p-2 align-top">
                                            <input
                                                type="number"
                                                className="border px-2 py-1 rounded w-28"
                                                value={d.stock ?? 0}
                                                onChange={(e) =>
                                                    setDeclinaisonField(
                                                        d.keys,
                                                        "stock",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* IMAGE */}
                                        <td className="p-2 align-top">
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    placeholder="url image"
                                                    className="border px-2 py-1 rounded w-48"
                                                    value={d.image ?? ""}
                                                    onChange={(e) =>
                                                        setDeclinaisonField(
                                                            d.keys,
                                                            "image",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {d.image && (
                                                    <img
                                                        src={d.image}
                                                        alt="mini"
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Product ID: {productId ?? "—"}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                downloadCSV("declinaisons_export.csv", declinaisons)
                            }
                            className="px-3 py-2 border rounded"
                        >
                            Télécharger CSV
                        </button>

                        <button
                            onClick={saveAll}
                            className="px-3 py-2 bg-green-600 text-white rounded"
                        >
                            Enregistrer les déclinaisons
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

/* ----------------------------------------------------------
 * ValueListEditor (TS)
 * -------------------------------------------------------- */

interface ValueListEditorProps {
    attr: Attribute;
    onAdd: (val: string, meta: any) => void;
    onRemove: (id: string) => void;
}

function ValueListEditor({ attr, onAdd, onRemove }: ValueListEditorProps) {
    const [input, setInput] = useState("");
    const [metaField, setMetaField] = useState("");

    function handleAdd() {
        if (!input.trim()) return;

        const meta: any = {};
        if (attr.type === "color") meta.color = metaField || input;
        if (attr.type === "image") meta.image = metaField || "";

        onAdd(input.trim(), meta);

        setInput("");
        setMetaField("");
    }

    return (
        <div>
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                        attr.type === "color" ? "ex: #ff0000" : "Nouvelle valeur"
                    }
                    className="border px-2 py-1 rounded flex-1"
                />

                {(attr.type === "image" || attr.type === "color") && (
                    <input
                        value={metaField}
                        onChange={(e) => setMetaField(e.target.value)}
                        placeholder={
                            attr.type === "image"
                                ? "URL image (optionnel)"
                                : "Hex couleur (optionnel)"
                        }
                        className="border px-2 py-1 rounded w-64"
                    />
                )}

                <button
                    onClick={handleAdd}
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                    Ajouter
                </button>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
                {(attr.valeurs || []).map((v) => (
                    <div
                        key={v.id}
                        className="flex items-center gap-2 p-2 border rounded"
                    >
                        <div className="flex-1">
                            <div className="text-sm font-medium">{v.valeur}</div>

                            {v.meta?.color && (
                                <div className="text-xs text-gray-500">{v.meta.color}</div>
                            )}
                        </div>

                        <div className="flex gap-2 items-center">
                            {attr.type === "color" && v.meta?.color && (
                                <div
                                    className="w-6 h-6 rounded"
                                    style={{ backgroundColor: v.meta.color }}
                                />
                            )}

                            {attr.type === "image" && v.meta?.image && (
                                <img
                                    src={v.meta.image}
                                    alt="mini"
                                    className="w-10 h-10 object-cover rounded"
                                />
                            )}

                            <button
                                onClick={() => onRemove(v.id)}
                                className="text-xs px-2 py-1 border rounded"
                            >
                                Suppr
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
