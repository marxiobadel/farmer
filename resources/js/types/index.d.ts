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
    settings: {
        address: string;
        email: string;
        phone: string;
        facebook_url: string;
        instagram_url: string;
        linkedin_url: string;
        twitter_url: string;
        youtube_url: string;
    };
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
