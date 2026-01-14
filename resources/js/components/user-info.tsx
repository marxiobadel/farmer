import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { formatName } from '@/lib/utils';
import { type User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage className="object-cover" src={user?.avatar_url} alt={user?.fullname || 'user'} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user?.fullname || 'user')}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{formatName(user?.fullname || 'user')}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user?.email || 'user@example.com'}
                    </span>
                )}
            </div>
        </>
    );
}
