import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
};

export function classNames(...arr: Array<string | false | null | undefined>): string {
    return arr.filter(Boolean).join(" ")
};

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
};

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
};

export const inputClassNames = (...arr: Array<string | false | null | undefined>): string => {
    return classNames("focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent", ...arr);
};

export const formatTime = (time: string): string => {
    const date = new Date(`1970-01-01T${time}`);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

export const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
};

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
    return [...new Map(array.map((item) => [item[key], item])).values()];
};

export function formatName(name: string): string {
    if (!name) return '';

    // Séparer les mots et filtrer les vides
    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {
        // Un seul mot : première lettre en majuscule
        return words[0][0].toUpperCase() + words[0].slice(1).toLowerCase();
    }

    // Deux mots max
    const firstWord = words[0][0].toUpperCase() + '.';
    const secondWord = words[1][0].toUpperCase() + words[1].slice(1).toLowerCase();

    return `${firstWord} ${secondWord}`;
};
