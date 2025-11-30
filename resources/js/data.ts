// OUR FARMER KEYWORDS FOR SEO
interface ReviewRating {
    label: string;
    percentage: number;
}

export const farmEcommerceKeywords: string[] = [
    "ferme",
    "e-commerce agricole",
    "vente d'œufs",
    "œufs frais",
    "poulets de ferme",
    "poulets élevés en plein air",
    "poulets prêts à cuire",
    "vente de volailles",
    "élevage de poules",
    "production d'œufs",
    "viande de porc",
    "porcs fermiers",
    "vente de porcs",
    "élevage porcin",
    "produits fermiers",
    "alimentation naturelle",
    "ferme locale",
    "agriculture durable",
    "produits bio",
    "vente directe producteur",
    "produits de la ferme",
    "agroalimentaire",
    "boutique fermière",
    "commande en ligne",
    "livraison produits fermiers",
    "ferme en ligne",
    "marché local",
    "poulailler",
    "élevage traditionnel",
    "élevage responsable",
    "producteur local",
    "produits frais",
    "commerce agricole",
    "marché fermier",
    "vente de viande",
    "viande fraîche",
    "élevage de volailles",
    "élevage de porcs",
    "circuits courts",
    "agriculture familiale",
    "produits naturels",
];

export const siteMeta = {
    title: "Ferme en Ligne | Œufs Frais, Poulets et Porcs Fermiers",
    shortDescription:
        "Produits fermiers frais : œufs, poulets, porcs et autres produits locaux directement de notre ferme.",
    longDescription:
        "Bienvenue sur notre boutique fermière en ligne. Nous proposons des œufs frais, des poulets élevés en plein air, des porcs fermiers et divers produits naturels issus de notre propre élevage. Profitez de produits de qualité, locaux et responsables, livrés directement depuis notre ferme. Commandez facilement en ligne et soutenez l'agriculture locale."
};

export const userRoles = [
    { label: 'Visiteur', value: 'visitor' },
    { label: 'Client', value: 'customer' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'superadmin' },
];

export const languageOptions = [
    { iso: "EN", name: "Anglais" },
    { iso: "FR", name: "Français" },
];

export const reviewRatings: ReviewRating[] = [
    { label: "Excellent", percentage: 100 },
    { label: "Très bien", percentage: 70 },
    { label: "Moyen", percentage: 50 },
    { label: "Médiocre", percentage: 30 },
    { label: "Terrible", percentage: 0 },
];

export const productStatus = [
    { label: "Brouillon", value: 'draft' },
    { label: "Publié", value: 'published' },
    { label: "Archivé", value: 'archived' }
];
