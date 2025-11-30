import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import Can from './can';

interface MenuItems {
    mainNavItems: NavItem[];
    manageNavItems: NavItem[];
    otherNavItems: NavItem[];
}

interface NavMainProps {
    menuItems: MenuItems;
}

export function NavMain({ menuItems }: NavMainProps) {
    const { url } = usePage<SharedData>();

    const buttonClass =
        "flex items-center gap-2 hover:bg-primary/10 hover:text-primary " +
        "data-[active=true]:bg-primary/15 data-[active=true]:text-primary transition-colors";

    const renderMenuItems = (items: NavItem[]) =>
        items.length > 0 ? (
            items.map(item => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                        asChild
                        isActive={typeof item.href === "string" && item.href.endsWith(url)}
                        tooltip={{ children: item.title }}
                        className={buttonClass}
                    >
                        <Link href={item.href} prefetch className="flex items-center gap-2">
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))
        ) : (
            <p className="px-4 py-2 text-sm text-muted-foreground">Aucun résultat</p>
        );

    return (
        <>
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>ACCUEIL</SidebarGroupLabel>
                <SidebarMenu>
                    {renderMenuItems(menuItems.mainNavItems)}
                </SidebarMenu>
            </SidebarGroup>

            <Can role="superadmin">
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>GESTION</SidebarGroupLabel>
                    <SidebarMenu>
                        {renderMenuItems(menuItems.manageNavItems)}
                    </SidebarMenu>
                </SidebarGroup>
            </Can>

            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>AUTRES</SidebarGroupLabel>
                <SidebarMenu>
                    {renderMenuItems(menuItems.otherNavItems)}
                </SidebarMenu>
            </SidebarGroup>
        </>
    );
}
