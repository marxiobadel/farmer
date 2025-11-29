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
import { Headphones, LayoutGrid, User2 } from 'lucide-react';
import AppLogo from './app-logo';
import { index as usersIndex } from '@/routes/users';

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
        href: usersIndex().url,
        icon: User2,
    },
];

const menuItems = { mainNavItems, manageNavItems, }

const footerNavItems: NavItem[] = [
    {
        title: 'Aide et Centre',
        href: '#',
        icon: Headphones,
    },
];

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
