import AppLayout from '@/layouts/app/app-sidebar-layout';
import guestLayout from '@/layouts/app/app-header-layout';
import type { SharedData, BreadcrumbItem } from '@/types';
import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { usePage } from '@inertiajs/react';
import { handleSystemThemeChange, initializeTheme, mediaQuery } from '@/hooks/use-appearance';

interface AppLayoutProps {
    children: ReactNode;
    layout?: 'app' | 'guest';
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, layout = 'app', breadcrumbs, ...props }: AppLayoutProps) => {
    const AppLayoutTemplate = layout === 'guest' ? guestLayout : AppLayout;

    const { isAdminSection } = usePage<SharedData>().props;

    useEffect(() => {
        initializeTheme(isAdminSection);

        return () => {
            mediaQuery()?.removeEventListener('change', handleSystemThemeChange);
        };
    }, [isAdminSection]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-right" duration={5000} />
        </AppLayoutTemplate>
    );
}
