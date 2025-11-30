import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { FileQuestion, LayoutGrid, MessageCircle, User2 } from 'lucide-react';
import AppLogo from './app-logo';
import admin from '@/routes/admin';

const mainNavItems: NavItem[] = [
    {
        title: 'Tableau de bord',
        href: dashboard().url,
        icon: LayoutGrid,
    },
];

const manageNavItems: NavItem[] = [
    {
        title: 'Utilisateurs',
        href: admin.users.index().url,
        icon: User2,
    },
];

const otherNavItems: NavItem[] = [
    {
        title: 'FAQs',
        href: admin.faqs.index().url,
        icon: FileQuestion,
    },
    {
        title: 'Contacts',
        href: admin.contacts.index().url,
        icon: MessageCircle,
    },
];

const menuItems = { mainNavItems, manageNavItems, otherNavItems }

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain menuItems={menuItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter menuItems={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
