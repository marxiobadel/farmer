import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { useInitials } from '@/hooks/use-initials';
import { UserMenuContent } from './user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();

    const auth = page.props.auth;

    const getInitials = useInitials();

    const isMobile = useIsMobile();

    const unreadCount = 0;

    return (
        <header className={`flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4`}>
            {/* Left side: Sidebar + Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right side: Notifications + User Menu */}
            <div className="flex items-center gap-4">
                {/* Notification Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 rounded-full hover:bg-muted focus:outline-none">
                            <Bell className="h-5 w-5" />
                            {/* Example badge */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-64 overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start">
                                <span className="text-sm">Nouveau commentaire sur votre article</span>
                                <span className="text-xs text-muted-foreground">Il y a 5 minutes</span>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-sm text-primary">
                            Voir toutes les notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Dropdown */}
                {!isMobile &&
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 focus:outline-none">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={auth.user?.avatar_url} alt={auth.user?.lastname || 'user'} />
                                    <AvatarFallback>{getInitials(auth.user?.lastname || 'user')}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-sm font-medium">{auth.user?.lastname}</span>
                                    {auth.user?.roles.length > 0 &&
                                        <span className="text-xs text-muted-foreground">{auth.user?.roles[0]}</span>}
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>}
            </div>
        </header>
    );
}
