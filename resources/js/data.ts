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

export const colorMap: Record<string, string> = {
    pending: "bg-gray-200 text-gray-800",
    processing: "bg-blue-100 text-blue-800",
    packing: "bg-blue-200 text-blue-900",
    awaiting_pickup: "bg-orange-100 text-orange-800",
    picked_up: "bg-indigo-100 text-indigo-800",
    in_transit: "bg-purple-100 text-purple-800",
    at_hub: "bg-violet-100 text-violet-800",
    out_for_delivery: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",

    delivery_issue: "bg-red-100 text-red-800",
    wrong_address: "bg-red-200 text-red-900",
    recipient_absent: "bg-orange-200 text-orange-900",
    returned: "bg-pink-200 text-pink-900",

    completed: "bg-green-200 text-green-900",
    cancelled: "bg-red-300 text-red-900",
};

export const orderDeliveryStatus = [
    { label: "En attente de paiement", value: "pending" },
    { label: "En traitement", value: "processing" }, // Le paiement est validé. L'entrepôt reçoit l'ordre de commande.
    { label: "En préparation", value: "packing" }, // L'équipe logistique est en train d'emballer les produits (mise en carton).
    { label: "En attente de ramassage", value: "awaiting_pickup" }, // Le colis est prêt, étiqueté et attend que le transporteur (ex: DHL, La Poste) vienne le chercher à l'entrepôt.
    { label: "Pris en charge par le transporteur", value: "picked_up" }, // Le transporteur a scanné le colis et l'a récupéré.
    { label: "En transit", value: "in_transit" }, // Le colis voyage entre deux centres ou vers la ville de destination.
    { label: "Arrivé au centre de distribution", value: "at_hub" }, // Le colis est arrivé dans un centre de tri régional ou local.
    { label: "En cours de livraison", value: "out_for_delivery" }, // Le colis est dans le camion du livreur final ("Dernier kilomètre").
    { label: "Livré", value: "delivered" }, // Le client a reçu le colis.

    // Problèmes potentiels
    { label: "Problème de livraison", value: "delivery_issue" }, // Retard global, accident, ou problème non spécifié.
    { label: "Adresse incorrecte", value: "wrong_address" }, // Le livreur ne trouve pas le lieu.
    { label: "Destinataire absent", value: "recipient_absent" }, // Tentative de livraison échouée.
    { label: "Retourné à l'expéditeur", value: "returned" }, // Après plusieurs échecs ou refus, le colis revient chez vous.

    // Finaux
    { label: "Terminée", value: "completed" }, // La commande est close (délai de rétractation passé ou satisfaction confirmée). Souvent utilisé pour déclencher les points de fidélité.
    { label: "Annulée", value: "cancelled" }, // La commande a été stoppée avant expédition.
];

export const paymentStatus = [
    { label: "En attente", value: "pending" },
    { label: "Payé", value: "completed" },
    { label: "Echoué", value: "failed" },
    { label: "Annulé", value: "cancelled" },
    { label: "Retourné", value: "refunded" },
];

export const paymentMethods = [
    { label: "Cash", value: "cash" },
    { label: "Orange Money", value: "orange_money" },
    { label: "MTN Money", value: "mtn_money" },
];

// --- Styles Helpers ---
export const movementTypeStyles: Record<string, string> = {
    sale: "bg-blue-100 text-blue-700 border-blue-200",
    restock: "bg-green-100 text-green-700 border-green-200",
    correction: "bg-orange-100 text-orange-700 border-orange-200",
    adjustment: "bg-orange-100 text-orange-700 border-orange-200",
    return: "bg-purple-100 text-purple-700 border-purple-200",
    destruction: "bg-red-100 text-red-700 border-red-200",
    initial: "bg-gray-100 text-gray-700 border-gray-200",
};

export const movementTypeLabels: Record<string, string> = {
    sale: "Vente",
    restock: "Réappro.",
    correction: "Correction",
    adjustment: "Ajustement",
    return: "Retour",
    destruction: "Destruction",
    initial: "Initial",
};

export const businessTypes = [
    { value: "restaurant", label: "Restaurant / Traiteur" },
    { value: "hotel", label: "Hôtellerie" },
    { value: "bakery", label: "Boulangerie / Pâtisserie" },
    { value: "reseller", label: "Supermarché / Revendeur" },
    { value: "other", label: "Autre" },
];
