import { ReactNode } from 'react';
import { Role, Permission } from '@/types';
import { useRole } from '@/hooks/use-role';
import { usePermission } from '@/hooks/use-permission';

interface CanProps {
    role?: Role;
    roles?: Role[];
    permission?: Permission;
    permissions?: Permission[];
    children: ReactNode;
}

export default function Can({ role, roles = [], permission, permissions = [], children }: CanProps) {
    const { hasRole, hasAnyRole } = useRole();
    const { hasPermission, hasAnyPermission } = usePermission();

    let allowed = false;

    if (role) allowed = hasRole(role);
    if (roles.length) allowed = hasAnyRole(roles);
    if (permission) allowed = hasPermission(permission);
    if (permissions.length) allowed = hasAnyPermission(permissions);

    return allowed ? <>{children}</> : null;
}
