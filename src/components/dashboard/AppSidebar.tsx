import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  ClipboardList, 
  FileText,
  LayoutDashboard,
  Settings,
  Pill,
  Shield,
  Building2
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { usePermissions, menuAccessByRole } from '@/hooks/usePermissions';
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
  { title: 'Sales', url: '/dashboard/sales', icon: ShoppingCart },
  { title: 'Suppliers', url: '/dashboard/suppliers', icon: Truck },
  { title: 'Manufacturers', url: '/dashboard/manufacturers', icon: Building2 },
  { title: 'Daily Cash', url: '/dashboard/daily-cash', icon: Wallet },
  { title: 'Stock Short', url: '/dashboard/stock-short', icon: ClipboardList },
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

  // Filter menu items based on role permissions
  const allowedRoutes = menuAccessByRole[role] || [];
  const filteredMainMenuItems = mainMenuItems.filter(item => 
    allowedRoutes.includes(item.url)
  );
  const filteredSettingsItems = settingsItems.filter(item =>
    allowedRoutes.includes(item.url)
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="p-1.5 rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <Pill className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-display font-bold text-foreground">
              Med<span className="text-primary">Flow</span>x
            </span>
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
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Free Trial</p>
              <p>7 days remaining</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
