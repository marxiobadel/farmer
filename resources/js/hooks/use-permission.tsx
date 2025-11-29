import { Permission, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth?.user?.permissions || [];

    const hasPermission = (permission: Permission) => permissions.includes(permission);
    const hasAnyPermission = (permissionArray: Permission[]) => permissionArray.some(p => hasPermission(p)); 

    return { permissions, hasPermission, hasAnyPermission };
}
