import { useUserRole } from '@/hooks/useAdminData';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useMyPermissions } from '@/hooks/useStaffPermissions';

export type Permission = 
  | 'create_staff'
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
  | 'view_admin'
  | 'view_customer_dues'
  | 'manage_customer_dues';

// Define permissions for each role (admin roles only - staff uses database permissions)
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
    'create_staff',
    'view_customer_dues',
    'manage_customer_dues',
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
    'create_staff',
    'view_customer_dues',
    'manage_customer_dues',
  ],
  client_staff: [
    'view_dashboard',
  ],
};

// Define which menu items each role can access
export const menuAccessByRole: Record<string, string[]> = {
  owner_admin: [
    '/dashboard',
    '/dashboard/medicines',
    '/dashboard/batches',
    '/dashboard/expiry',
    '/dashboard/alerts',
    '/dashboard/sales',
    '/dashboard/customer-dues',
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
    '/dashboard/batches',
    '/dashboard/expiry',
    '/dashboard/alerts',
    '/dashboard/sales',
    '/dashboard/customer-dues',
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
    '/dashboard/batches',
    '/dashboard/expiry',
    '/dashboard/alerts',
    '/dashboard/sales',
    '/dashboard/customer-dues',
    '/dashboard/daily-cash',
  ],
};

export function usePermissions() {
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { isTrial, isLoading: subscriptionLoading, isOwnerAdmin: isOwnerAdminFromSubscription } = useSubscriptionStatus();
  const { data: staffDbPermissions, isLoading: staffPermissionsLoading } = useMyPermissions();
  
  const currentRole = role || 'client_staff';
  const isStaff = currentRole === 'client_staff';
  
  // Build permissions based on role
  let permissions: Permission[] = [];
  
  if (isStaff && staffDbPermissions) {
    // Staff permissions from database
    permissions = ['view_dashboard'];
    
    if (staffDbPermissions.can_view_medicines) permissions.push('view_medicines');
    if (staffDbPermissions.can_manage_medicines) permissions.push('manage_medicines');
    if (staffDbPermissions.can_view_sales) permissions.push('view_sales');
    if (staffDbPermissions.can_manage_sales) permissions.push('manage_sales');
    if (staffDbPermissions.can_view_customer_dues) permissions.push('view_customer_dues');
    if (staffDbPermissions.can_manage_customer_dues) permissions.push('manage_customer_dues');
    if (staffDbPermissions.can_view_suppliers) permissions.push('view_suppliers');
    if (staffDbPermissions.can_manage_suppliers) permissions.push('manage_suppliers');
    if (staffDbPermissions.can_view_manufacturers) permissions.push('view_manufacturers');
    if (staffDbPermissions.can_view_daily_cash) permissions.push('view_daily_cash');
    if (staffDbPermissions.can_manage_daily_cash) permissions.push('manage_daily_cash');
    if (staffDbPermissions.can_view_stock_short) permissions.push('view_stock_short');
    if (staffDbPermissions.can_view_reports) permissions.push('view_reports');
  } else if (isStaff) {
    // Default staff permissions if no database record exists
    permissions = [
      'view_dashboard',
      'view_medicines',
      'view_sales',
      'manage_sales',
      'view_customer_dues',
      'view_daily_cash',
      'manage_daily_cash',
    ];
  } else {
    // Admin permissions from static config
    permissions = [...(rolePermissions[currentRole] || [])];
  }

  // Trial users cannot create staff members
  if (isTrial && currentRole === 'client_admin') {
    permissions = permissions.filter(p => p !== 'create_staff');
  }

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const canAccessRoute = (route: string): boolean => {
    if (isStaff && staffDbPermissions) {
      // Dynamic route access for staff based on database permissions
      const routeMap: Record<string, boolean> = {
        '/dashboard': true,
        '/dashboard/medicines': staffDbPermissions.can_view_medicines,
        '/dashboard/batches': staffDbPermissions.can_view_medicines,
        '/dashboard/expiry': staffDbPermissions.can_view_medicines,
        '/dashboard/alerts': staffDbPermissions.can_view_medicines,
        '/dashboard/sales': staffDbPermissions.can_view_sales,
        '/dashboard/customer-dues': staffDbPermissions.can_view_customer_dues,
        '/dashboard/suppliers': staffDbPermissions.can_view_suppliers,
        '/dashboard/manufacturers': staffDbPermissions.can_view_manufacturers,
        '/dashboard/daily-cash': staffDbPermissions.can_view_daily_cash,
        '/dashboard/stock-short': staffDbPermissions.can_view_stock_short,
        '/dashboard/reports': staffDbPermissions.can_view_reports,
      };
      return routeMap[route] ?? false;
    }
    
    const allowedRoutes = menuAccessByRole[currentRole] || [];
    return allowedRoutes.includes(route);
  };

  // Helper specifically for staff creation
  const canCreateStaff = (): boolean => {
    if (isOwnerAdminFromSubscription) return true;
    if (currentRole !== 'client_admin') return false;
    if (isTrial) return false;
    return true;
  };

  const isAdmin = currentRole === 'client_admin' || currentRole === 'owner_admin';
  const isOwnerAdmin = currentRole === 'owner_admin';

  return {
    role: currentRole,
    isLoading: roleLoading || subscriptionLoading || (isStaff && staffPermissionsLoading),
    permissions,
    hasPermission,
    canAccessRoute,
    canCreateStaff,
    isStaff,
    isAdmin,
    isOwnerAdmin,
    isTrial,
    staffDbPermissions,
  };
}
