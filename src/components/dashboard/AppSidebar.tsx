import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  FileText,
  LayoutDashboard,
  Settings,
  Pill,
  Shield,
  Building2,
  Layers,
  Users,
  AlertTriangle,
  Bell,
  Store
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { usePermissions, menuAccessByRole } from '@/hooks/usePermissions';
import { useEnabledFeatures } from '@/hooks/useFeatureFlags';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useProfile } from '@/hooks/useProfile';
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

const mainMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Medicines', url: '/dashboard/medicines', icon: Package },
  { title: 'Batches', url: '/dashboard/batches', icon: Layers },
  { title: 'Expiry Monitor', url: '/dashboard/expiry', icon: AlertTriangle },
  { title: 'Alerts', url: '/dashboard/alerts', icon: Bell },
  { title: 'Sales', url: '/dashboard/sales', icon: ShoppingCart },
  { title: 'Customer Dues', url: '/dashboard/customer-dues', icon: Users },
  { title: 'Suppliers', url: '/dashboard/suppliers', icon: Truck },
  { title: 'Manufacturers', url: '/dashboard/manufacturers', icon: Building2 },
  { title: 'Daily Cash', url: '/dashboard/daily-cash', icon: Wallet },
  { title: 'Reports', url: '/dashboard/reports', icon: FileText },
];

const settingsItems = [
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

const adminItems = [
  { title: 'Admin Dashboard', url: '/dashboard/admin', icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { role, isOwnerAdmin, canAccessRoute } = usePermissions();
  const { isRouteEnabled } = useEnabledFeatures();
  const { isTrial, daysRemaining, planType } = useSubscriptionStatus();
  const { data: profile } = useProfile();

  // Filter menu items based on role permissions AND feature flags
  const allowedRoutes = menuAccessByRole[role] || [];
  const filteredMainMenuItems = mainMenuItems.filter(item => 
    allowedRoutes.includes(item.url) && isRouteEnabled(item.url)
  );
  const filteredSettingsItems = settingsItems.filter(item =>
    allowedRoutes.includes(item.url) && isRouteEnabled(item.url)
  );

  const getSubscriptionLabel = () => {
    if (isOwnerAdmin) return 'Owner Admin';
    if (isTrial) return 'Free Trial';
    if (planType === 'monthly') return 'Monthly Plan';
    if (planType === 'yearly') return 'Yearly Plan';
    if (planType === 'lifetime') return 'Lifetime';
    return 'Active';
  };

  const getSubscriptionSubtext = () => {
    if (isOwnerAdmin) return 'Full Access';
    if (daysRemaining) return `${daysRemaining} days remaining`;
    return '';
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
                {role === 'owner_admin' ? 'Owner' : role === 'client_admin' ? 'Admin' : 'Staff'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isOwnerAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-destructive">Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-2"
                        activeClassName="bg-destructive/10 text-destructive font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/dashboard'}
                      className="flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredSettingsItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSettingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-2"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-3">
          {!isCollapsed ? (
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{getSubscriptionLabel()}</p>
              <p>{getSubscriptionSubtext()}</p>
              <p className="pt-2 border-t border-sidebar-border mt-2">
                © {new Date().getFullYear()} <span className="font-medium">MedFlowx</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Pill className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
