import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  FileText,
  LayoutDashboard,
  Shield,
  Building2,
  Layers,
  Users,
  AlertTriangle,
  Bell,
  Store
} from 'lucide-react';
import appLogo from '@/assets/app-logo.png';
import { NavLink } from '@/components/NavLink';
import { usePermissions, menuAccessByRole } from '@/hooks/usePermissions';
import { useEnabledFeatures } from '@/hooks/useFeatureFlags';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useProfile } from '@/hooks/useProfile';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';

// Badge configuration for menu items
const badgeConfig: Record<string, { key: 'expiryAlerts' | 'customerDues' | 'supplierDues'; variant: 'destructive' | 'secondary' | 'outline' }> = {
  '/dashboard/expiry': { key: 'expiryAlerts', variant: 'destructive' },
  '/dashboard/alerts': { key: 'expiryAlerts', variant: 'destructive' },
  '/dashboard/customer-dues': { key: 'customerDues', variant: 'secondary' },
  '/dashboard/suppliers': { key: 'supplierDues', variant: 'outline' },
};

// Menu items with translation keys
const menuItemsConfig = [
  { titleKey: 'dashboard', url: '/dashboard', icon: LayoutDashboard },
  { titleKey: 'medicines', url: '/dashboard/medicines', icon: Package },
  { titleKey: 'batches', url: '/dashboard/batches', icon: Layers },
  { titleKey: 'manufacturers', url: '/dashboard/manufacturers', icon: Building2 },
  { titleKey: 'suppliers', url: '/dashboard/suppliers', icon: Truck },
  { titleKey: 'sales', url: '/dashboard/sales', icon: ShoppingCart },
  { titleKey: 'customerDues', url: '/dashboard/customer-dues', icon: Users },
  { titleKey: 'dailyCash', url: '/dashboard/daily-cash', icon: Wallet },
  { titleKey: 'expiryMonitor', url: '/dashboard/expiry', icon: AlertTriangle },
  { titleKey: 'alerts', url: '/dashboard/alerts', icon: Bell },
  { titleKey: 'reports', url: '/dashboard/reports', icon: FileText },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';
  const { role, isOwnerAdmin, canAccessRoute } = usePermissions();
  const { isRouteEnabled } = useEnabledFeatures();
  const { isTrial, daysRemaining, planType } = useSubscriptionStatus();
  const { data: profile } = useProfile();
  const { data: badges } = useSidebarBadges();
  const { t } = useLanguage();

  // Handle navigation with mobile sidebar close
  const handleNavClick = (url: string) => (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      setOpenMobile(false);
      // Small delay to let the sidebar close animation start
      setTimeout(() => {
        navigate(url);
      }, 50);
    }
  };

  // Helper to get badge count for a menu item
  const getBadgeCount = (url: string): number => {
    const config = badgeConfig[url];
    if (!config || !badges) return 0;
    return badges[config.key] || 0;
  };

  const getBadgeVariant = (url: string) => {
    return badgeConfig[url]?.variant || 'secondary';
  };

  // Get all allowed routes for filtering
  const allowedRoutes = menuAccessByRole[role] || [];

  // Build menu groups with translations
  const menuGroups = [
    {
      label: null, // Overview - no label needed
      items: [
        { titleKey: 'dashboard', url: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      labelKey: 'inventory',
      items: [
        { titleKey: 'medicines', url: '/dashboard/medicines', icon: Package },
        { titleKey: 'batches', url: '/dashboard/batches', icon: Layers },
        { titleKey: 'manufacturers', url: '/dashboard/manufacturers', icon: Building2 },
        { titleKey: 'suppliers', url: '/dashboard/suppliers', icon: Truck },
      ]
    },
    {
      labelKey: 'salesFinance',
      items: [
        { titleKey: 'sales', url: '/dashboard/sales', icon: ShoppingCart },
        { titleKey: 'customerDues', url: '/dashboard/customer-dues', icon: Users },
        { titleKey: 'dailyCash', url: '/dashboard/daily-cash', icon: Wallet },
      ]
    },
    {
      labelKey: 'monitoring',
      items: [
        { titleKey: 'expiryMonitor', url: '/dashboard/expiry', icon: AlertTriangle },
        { titleKey: 'alerts', url: '/dashboard/alerts', icon: Bell },
      ]
    },
    {
      labelKey: 'analytics',
      items: [
        { titleKey: 'reports', url: '/dashboard/reports', icon: FileText },
      ]
    },
  ];

  // Get translated title
  const getItemTitle = (titleKey: string): string => {
    return t.nav[titleKey as keyof typeof t.nav] || titleKey;
  };

  // Get translated group label
  const getGroupLabel = (labelKey: string | undefined): string | null => {
    if (!labelKey) return null;
    return t.menuGroups[labelKey as keyof typeof t.menuGroups] || labelKey;
  };
  
  // Filter menu groups based on role permissions AND feature flags
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      allowedRoutes.includes(item.url) && isRouteEnabled(item.url)
    )
  })).filter(group => group.items.length > 0);

  const getSubscriptionLabel = () => {
    if (isOwnerAdmin) return t.roles.ownerAdmin;
    if (isTrial) return t.subscription.freeTrial;
    if (planType === 'monthly') return t.subscription.monthlyPlan;
    if (planType === 'yearly') return t.subscription.yearlyPlan;
    if (planType === 'lifetime') return t.subscription.lifetime;
    return t.subscription.active;
  };

  const getSubscriptionSubtext = () => {
    if (isOwnerAdmin) return t.subscription.fullAccess;
    if (daysRemaining) return `${daysRemaining} ${t.subscription.daysRemaining}`;
    return '';
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'owner_admin':
        return t.roles.owner;
      case 'client_admin':
        return t.roles.admin;
      case 'client_staff':
        return t.roles.staff;
      default:
        return '';
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {/* Pharmacy Info */}
        <div className="flex items-center gap-2 px-2 py-2 mx-2 my-1 rounded-lg bg-sidebar-accent/50">
          {profile?.pharmacy_logo ? (
            <img 
              src={profile.pharmacy_logo} 
              alt={profile?.pharmacy_name || 'Pharmacy logo'} 
              className="h-8 w-8 rounded-md object-cover flex-shrink-0"
            />
          ) : (
            <div className="p-1.5 rounded-md bg-primary/10 text-primary flex-shrink-0">
              <Store className="h-4 w-4" />
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {profile?.pharmacy_name || 'My Pharmacy'}
              </span>
              <span className="text-xs text-muted-foreground">
                {getRoleLabel()}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isOwnerAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-destructive">{t.menuGroups.admin}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={t.nav.adminDashboard}>
                    <NavLink 
                      to="/dashboard/admin"
                      onClick={handleNavClick('/dashboard/admin')}
                      className="flex items-center gap-2"
                      activeClassName="bg-destructive/10 text-destructive font-medium"
                    >
                      <Shield className="h-4 w-4" />
                      <span>{t.nav.adminDashboard}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredMenuGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.labelKey || 'overview'}>
            {group.labelKey && (
              <SidebarGroupLabel className="text-xs text-muted-foreground">
                {getGroupLabel(group.labelKey)}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const badgeCount = getBadgeCount(item.url);
                  const badgeVariant = getBadgeVariant(item.url);
                  const title = getItemTitle(item.titleKey);
                  
                  return (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton asChild tooltip={title}>
                        <NavLink 
                          to={item.url} 
                          end={item.url === '/dashboard'}
                          onClick={handleNavClick(item.url)}
                          className="flex items-center gap-2 justify-between w-full"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{title}</span>
                          </div>
                          {badgeCount > 0 && !isCollapsed && (
                            <Badge 
                              variant={badgeVariant} 
                              className="h-5 min-w-5 px-1.5 text-xs font-medium"
                            >
                              {badgeCount > 99 ? '99+' : badgeCount}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-3">
          {!isCollapsed ? (
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{getSubscriptionLabel()}</p>
              <p>{getSubscriptionSubtext()}</p>
              <p className="pt-2 border-t border-sidebar-border mt-2">
                {t.footer.copyright} {new Date().getFullYear()} <span className="font-medium">MedFlowx</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <img src={appLogo} alt="MedFlowx" className="h-6 w-6 rounded object-cover" />
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
