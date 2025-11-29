import { Role, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function useRole() {
    const { auth } = usePage<SharedData>().props;
    const roles = auth?.user?.roles || [];

    const hasRole = (role: Role) => roles.includes(role);
    const hasAnyRole = (roleArray: Role[]) => roleArray.some(r => hasRole(r)); 

    return { roles, hasRole, hasAnyRole };
}
