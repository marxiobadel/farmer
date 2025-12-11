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

export const fonts = ["Arial", "Georgia", "Times New Roman", "Courier New"];

export const pricingTypes = [
    { label: "Prix fixe", value: "fixed" },
    { label: "Par poids", value: "weight" },
    { label: "Par prix de commande", value: "price" },
    { label: "Par volume", value: "volume" },
];

export const orderDeliveryStatus = [
    { label: "En attente de paiement", value: "pending" },
    { label: "En traitement", value: "processing" },
    { label: "En préparation", value: "packing" },
    { label: "En attente de ramassage", value: "awaiting_pickup" },
    { label: "Pris en charge par le transporteur", value: "picked_up" },
    { label: "En transit", value: "in_transit" },
    { label: "Arrivé au centre de distribution", value: "at_hub" },
    { label: "En cours de livraison", value: "out_for_delivery" },
    { label: "Livré", value: "delivered" },

    // Problèmes potentiels
    { label: "Problème de livraison", value: "delivery_issue" },
    { label: "Adresse incorrecte", value: "wrong_address" },
    { label: "Destinataire absent", value: "recipient_absent" },
    { label: "Retourné à l'expéditeur", value: "returned" },

    // Finaux
    { label: "Terminée", value: "completed" },
    { label: "Annulée", value: "cancelled" },
];

export const paymentMethods = [
    { label: "Cash", value: "cash" },
];
