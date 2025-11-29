import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    layout?: 'app' | 'guest';
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, layout = 'app', breadcrumbs, ...props }: AppLayoutProps) => {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-right" duration={5000} />
        </AppLayoutTemplate>
    );
}
