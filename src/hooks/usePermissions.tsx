import { useUserRole } from '@/hooks/useAdminData';

export type Permission = 
  | 'view_dashboard'
  | 'view_medicines'
  | 'manage_medicines'
  | 'view_sales'
  | 'manage_sales'
  | 'view_suppliers'
  | 'manage_suppliers'
  | 'view_manufacturers'
  | 'manage_manufacturers'
  | 'view_daily_cash'
  | 'manage_daily_cash'
  | 'view_stock_short'
  | 'manage_stock_short'
  | 'view_reports'
  | 'view_settings'
  | 'manage_settings'
  | 'view_admin';

// Define permissions for each role
const rolePermissions: Record<string, Permission[]> = {
  owner_admin: [
    'view_dashboard',
    'view_medicines',
    'manage_medicines',
    'view_sales',
    'manage_sales',
    'view_suppliers',
    'manage_suppliers',
    'view_manufacturers',
    'manage_manufacturers',
    'view_daily_cash',
    'manage_daily_cash',
    'view_stock_short',
    'manage_stock_short',
    'view_reports',
    'view_settings',
    'manage_settings',
    'view_admin',
  ],
  client_admin: [
    'view_dashboard',
    'view_medicines',
    'manage_medicines',
    'view_sales',
    'manage_sales',
    'view_suppliers',
    'manage_suppliers',
    'view_manufacturers',
    'manage_manufacturers',
    'view_daily_cash',
    'manage_daily_cash',
    'view_stock_short',
    'manage_stock_short',
    'view_reports',
    'view_settings',
    'manage_settings',
  ],
  client_staff: [
    'view_dashboard',
    'view_medicines', // Read-only view
    'view_sales',
    'manage_sales', // Can create sales
    'view_daily_cash',
    'manage_daily_cash', // Can add costs
  ],
};

// Define which menu items each role can access
export const menuAccessByRole: Record<string, string[]> = {
  owner_admin: [
    '/dashboard',
    '/dashboard/medicines',
    '/dashboard/sales',
    '/dashboard/suppliers',
    '/dashboard/manufacturers',
    '/dashboard/daily-cash',
    '/dashboard/stock-short',
    '/dashboard/reports',
    '/dashboard/settings',
    '/dashboard/admin',
  ],
  client_admin: [
    '/dashboard',
    '/dashboard/medicines',
    '/dashboard/sales',
    '/dashboard/suppliers',
    '/dashboard/manufacturers',
    '/dashboard/daily-cash',
    '/dashboard/stock-short',
    '/dashboard/reports',
    '/dashboard/settings',
  ],
  client_staff: [
    '/dashboard',
    '/dashboard/medicines',
    '/dashboard/sales',
    '/dashboard/daily-cash',
  ],
};

export function usePermissions() {
  const { data: role, isLoading } = useUserRole();
  
  const currentRole = role || 'client_staff';
  const permissions = rolePermissions[currentRole] || [];

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const canAccessRoute = (route: string): boolean => {
    const allowedRoutes = menuAccessByRole[currentRole] || [];
    return allowedRoutes.includes(route);
  };

  const isStaff = currentRole === 'client_staff';
  const isAdmin = currentRole === 'client_admin' || currentRole === 'owner_admin';
  const isOwnerAdmin = currentRole === 'owner_admin';

  return {
    role: currentRole,
    isLoading,
    permissions,
    hasPermission,
    canAccessRoute,
    isStaff,
    isAdmin,
    isOwnerAdmin,
  };
}
