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

export const proStatus = [
    { label: "En attente", value: "pending" },
    { label: "Acceptée", value: "approved" },
    { label: "Rejetée", value: "rejected" },
];

export const paymentMethods = [
    { label: "Cash (à la livraison)", value: "cash" },
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

export const coefficients = [
    { label: "Multiplié par 1", value: "1" },
    { label: "Multiplié par la quantité", value: "quantity" }
];

export const COUNTRY_DIAL_CODES = [
    // Afrique Centrale & Ouest (Prioritaire)
    { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun" },
    { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
    { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal" },
    { code: "GA", dial: "+241", flag: "🇬🇦", name: "Gabon" },
    { code: "CG", dial: "+242", flag: "🇨🇬", name: "Congo" },
    { code: "CD", dial: "+243", flag: "🇨🇩", name: "RDC" },
    { code: "GQ", dial: "+240", flag: "🇬🇶", name: "Guinée Équatoriale" },
    { code: "TD", dial: "+235", flag: "🇹🇩", name: "Tchad" },
    { code: "CF", dial: "+236", flag: "🇨🇫", name: "Centrafrique" },
    { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "GH", dial: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "TG", dial: "+228", flag: "🇹🇬", name: "Togo" },
    { code: "BJ", dial: "+229", flag: "🇧🇯", name: "Bénin" },
    { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali" },
    { code: "BF", dial: "+226", flag: "🇧🇫", name: "Burkina Faso" },
    { code: "GN", dial: "+224", flag: "🇬🇳", name: "Guinée" },
    { code: "NE", dial: "+227", flag: "🇳🇪", name: "Niger" },
    { code: "RW", dial: "+250", flag: "🇷🇼", name: "Rwanda" },
    { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc" },
    { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algérie" },
    { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisie" },
    { code: "ZA", dial: "+27", flag: "🇿🇦", name: "Afrique du Sud" },

    // Europe & Amérique (Diaspora & B2B)
    { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
    { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgique" },
    { code: "CH", dial: "+41", flag: "🇨🇭", name: "Suisse" },
    { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
    { code: "US", dial: "+1", flag: "🇺🇸", name: "États-Unis" },
    { code: "GB", dial: "+44", flag: "🇬🇧", name: "Royaume-Uni" },
    { code: "DE", dial: "+49", flag: "🇩🇪", name: "Allemagne" },
    { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italie" },
    { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espagne" },
    { code: "AE", dial: "+971", flag: "🇦🇪", name: "Émirats Arabes Unis" },
    { code: "CN", dial: "+86", flag: "🇨🇳", name: "Chine" },
    { code: "TR", dial: "+90", flag: "🇹🇷", name: "Turquie" },
    { code: "IN", dial: "+91", flag: "🇮🇳", name: "Inde" },
    { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brésil" },
];
