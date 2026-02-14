import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    isAdminSection: boolean;
    settings: {
        address: string;
        email: string;
        phone: string;
        facebook_url: string;
        instagram_url: string;
        linkedin_url: string;
        twitter_url: string;
        youtube_url: string;
        headoffice: string;
        budget: string;
        registration: string;
        taxpayer_number: string;
        show_price: boolean;
    };
    flash: {
        success: string | null;
        error: string | null;
        warning: string | null;
        info: string | null;
    };
    cart?: Cart;
    defaultCurrency: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    firstname: string;
    lastname: string;
    fullname: string;
    phone: string;
    address: string;
    roles: string[];
    email: string;
    avatar_url?: string;
    email_verified_at: string | null;
    is_active: boolean;
    two_factor_enabled?: boolean;
    country: Country | null;
    addresses: Address[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Country {
    id: number;
    name: string;
    iso: string;
    iso3: string;
    phonecode: string;
    capital: string;
    region: string;
    subregion: string;
    latitude: string;
    longitude: string;
    emojiU: string;
    [key: string]: unknown;
}

export interface Address {
    id: number;
    alias: string;
    address: string;
    firstname: string;
    lastname: string;
    phone: string;
    city: string;
    street: string;
    state: string;
    postal_code: string;
    country: Country;
    country_id: string | number | null;
    user: User;
    is_default: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Faq {
    id: number;
    question: string;
    answer: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    slug: string;
    name: string;
    type: string;
    cover_url: string;
    status: boolean;
    products_count: number;
    position: number | string;
    products: Product[];
    parent_id: number | null;
    parent: Category; // For nested categories
    created_at: string;
    updated_at: string;
}

export interface ProductImage {
    id: number;
    url: string;
}

export interface AttributeOption {
    id: number;
    name: string;
}

export interface Attribute {
    id: number;
    name: string;
    type: string;
    options: AttributeOption[];
}

export interface VariantOption {
    attribute_id: number;
    attribute_option_id: number;
    attribute: string;
    option: string;
}

export interface Variant {
    id: number;
    sku: string;
    price: number;
    compare_at_price: number | null;
    quantity: number;
    is_default: boolean;
    image: string | null;
    options: VariantOption[];
}

export interface Address {
    id: number;
    alias: string;
    firstname: string;
    lastname: string;
    city: string;
    street: string;
    state: string;
    postal_code: string;
    phone?: string;
    company?: string;
    [key: string]: any;
}

export interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    variant_id: number | null;
    name: string | null;
    variant: VariantOption[] | null;
    product: Product | null;
    price: number;
    quantity: number;
    total: number;
    image: string | null;
}

export interface Cart {
    id: number;
    user_id: number | null;
    user: User | null;
    items: CartItem[];
    total_qty: number;
    coupon: Coupon | null;
    discount_amount: number;
    subtotal: number;
    total: number;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id: number | null;
    product: Product;
    variant: VariantOption[] | null;
    price: number;
    quantity: number;
    total: number;
    image: string | null;
}

export interface Order {
    id: number;
    user_id: number | null;
    user: User;
    carrier_id: number | null;
    carrier: Carrier;
    status: string;
    total: number;
    discount: number;
    coupon_code: string;

    items: OrderItem[];
    payments: Payment[];

    shipping_address: Address | Record<string, any> | null;
    invoice_address: Address | Record<string, any> | null;

    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: number;

    // Relations
    order_id: number;
    user_id?: number | null;

    // Identifiers
    reference?: string | null;
    transaction_id?: string | null;

    // Payment details
    method: string;       // e.g. "credit_card", "om", "momo"
    provider?: string | null;

    // Financial
    amount: number;
    currency: string;     // e.g. "XAF"

    // Status
    status: "pending" | "completed" | "failed" | "refunded" | "cancelled";

    // Gateway raw data
    details?: any;

    // Dates
    paid_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;

    origin: string;

    // Prices
    base_price: number;
    compare_at_price: number | null;
    quantity: number;

    weight: number;
    height: number;
    width: number;
    length: number;

    // Content
    description: string | null;

    // SEO
    short_description?: string;
    tags?: string;

    // Status
    status: 'published' | 'draft' | string;

    is_favorited: boolean;

    // Images
    default_image_id: number | string;
    default_image: string | null;
    images: ProductImage[];

    // Relations
    categories: Category[];
    attributes: Attribute[];
    variants: Variant[];

    created_at: string;
    updated_at: string;
}

export interface StockMovement {
    id: number;
    quantity: number;
    type: string;
    stock_before: number;
    stock_after: number;
    note?: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
    product: {
        id: number;
        name: string;
        slug: string;
        image?: string;
    };
    variant?: {
        id: number;
        name: string;
        sku: string;
    };
    reference?: {
        type: string;
        id: number;
        label: string;
        route_name?: string;
    };
}

export interface Testimonial {
    id: number;
    name: string;
    position: string;
    company: string;
    message: string;
    is_approved: boolean;
    user_id: number;
    product_id: number;
    rating: number;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface Zone {
    id: number;
    name: string;
    latitude: string | null;
    longitude: string | null;
    country: Country | null;
    country_id: number;
    rates: CarrierRate[];
    created_at: string;
    updated_at: string;
}

export interface CarrierRate {
    id: number;
    min_weight?: number | null;
    max_weight?: number | null;
    min_price?: number | null;
    max_price?: number | null;
    min_volume?: number | null;
    max_volume?: number | null;
    rate_price: number;
    coefficient?: string;
    delivery_time?: string | null;
    carrier_id: number;
    carrier: Carrier;
    zone_id: number;
    zone?: Zone; // relation optionnelle
}

export interface Carrier {
    id: number;
    name: string;
    description?: string | null;
    base_price?: number | null;
    free_shipping_min?: number | null;
    pricing_type?: string | null; // "weight" | "price" | "volume"
    is_active?: boolean;

    created_at: string;
    updated_at: string;

    rates?: CarrierRate[];
    zones?: Zone[];
}

export interface ProRequest {
    id: number;
    company_name: string;
    niu: string;
    contact_name: string;
    email: string;
    phone: string;
    activity_sector: string;
    address: string;
    message: string;
    user: User;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Coupon {
    id: number;
    code: string;
    type: 'fixed' | 'percent';
    value: number;
    min_order_amount: number;
    expires_at: string;
    usage_limit: number | null;
    usage_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type Role = 'visitor' | 'superadmin' | 'admin' | 'customer' | string;
export type Permission = 'access-admin' | 'manage-settings' | string;

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
