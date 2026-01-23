import { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsOwnerAdmin } from '@/hooks/useAdminData';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  FileText,
  History,
  Activity,
  Globe,
  LogOut,
  Loader2,
  Shield,
  Mail,
  Bell,
  Building2,
  Pill,
  Database,
  Menu,
  Smartphone,
  Lock,
  BookOpen,
  Phone,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import logoAuthFallback from '@/assets/logo-auth.png';

const navItems = [
  {
    title: 'Dashboard',
    href: '/owner',
    icon: LayoutDashboard,
  },
  {
    title: 'Client Management',
    href: '/owner/clients',
    icon: Users,
  },
  {
    title: 'Subscriptions',
    href: '/owner/subscriptions',
    icon: CreditCard,
  },
  {
    title: 'Payment Requests',
    href: '/owner/payment-requests',
    icon: Smartphone,
  },
  {
    title: 'Payments',
    href: '/owner/payments',
    icon: DollarSign,
  },
  {
    title: 'Pricing Plans',
    href: '/owner/pricing',
    icon: FileText,
  },
];

const masterDataItems = [
  {
    title: 'Global Manufacturers',
    href: '/owner/global-manufacturers',
    icon: Building2,
  },
  {
    title: 'Global Medicines',
    href: '/owner/global-medicines',
    icon: Pill,
  },
  {
    title: 'Medicine Reference',
    href: '/owner/medicine-reference',
    icon: BookOpen,
  },
];

const systemItems = [
  {
    title: 'Locked Accounts',
    href: '/owner/locked-accounts',
    icon: Lock,
  },
  {
    title: 'Feature Flags',
    href: '/owner/feature-flags',
    icon: Activity,
  },
  {
    title: 'System Review',
    href: '/owner/system-review',
    icon: Shield,
  },
  {
    title: 'CMS Manager',
    href: '/owner/cms',
    icon: Globe,
  },
  {
    title: 'Email Templates',
    href: '/owner/email-templates',
    icon: Mail,
  },
  {
    title: 'Notification Logs',
    href: '/owner/notification-logs',
    icon: Bell,
  },
  {
    title: 'Audit Logs',
    href: '/owner/logs',
    icon: History,
  },
];

const settingsItems = [
  { title: 'Branding', href: '/owner/settings/branding', icon: Settings },
  { title: 'Support Contact', href: '/owner/settings/support', icon: Phone },
  { title: 'Admin Team', href: '/owner/settings/admin-team', icon: Users },
  { title: 'SMTP Email', href: '/owner/settings/smtp', icon: Mail },
  { title: 'SMS Gateway', href: '/owner/settings/sms', icon: MessageSquare },
  { title: 'Notifications', href: '/owner/settings/notifications', icon: Bell },
  { title: 'Security Alerts', href: '/owner/settings/security', icon: ShieldAlert },
  { title: 'Payment Gateway', href: '/owner/settings/payment', icon: CreditCard },
  { title: 'System', href: '/owner/settings/system', icon: AlertTriangle },
];

// Sidebar content component to reuse in both desktop and mobile
function SidebarContentComponent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { logoAuth } = usePlatformBranding();
  const platformLogo = logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth;

  // Auto-expand sections based on current route
  const isMasterDataRoute = location.pathname.startsWith('/owner/global-') || location.pathname.startsWith('/owner/medicine-reference');
  const isSystemRoute = ['/owner/locked-accounts', '/owner/feature-flags', '/owner/system-review', '/owner/cms', '/owner/email-templates', '/owner/notification-logs', '/owner/logs'].some(path => location.pathname.startsWith(path));
  const isSettingsRoute = location.pathname.startsWith('/owner/settings');

  const [masterDataOpen, setMasterDataOpen] = useState(isMasterDataRoute);
  const [systemOpen, setSystemOpen] = useState(isSystemRoute);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute);

  // Update open state when route changes
  useEffect(() => {
    if (isMasterDataRoute) setMasterDataOpen(true);
    if (isSystemRoute) setSystemOpen(true);
    if (isSettingsRoute) setSettingsOpen(true);
  }, [isMasterDataRoute, isSystemRoute, isSettingsRoute]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <>
      {/* Logo/Brand - Minimal */}
      <div className="px-3 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <img src={platformLogo} alt="MedFlowx" className="h-8 w-8 rounded-md" />
          <div>
            <h1 className="font-semibold text-sm">Owner Panel</h1>
            <p className="text-[10px] text-muted-foreground">Master Control</p>
          </div>
        </div>
      </div>

      {/* Navigation - Minimal */}
      <ScrollArea className="flex-1 px-2 py-2">
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/owner'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Master Data - Collapsible Minimal */}
        <div className="mt-2 pt-2 border-t border-border/40">
          <Collapsible open={masterDataOpen} onOpenChange={setMasterDataOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-between w-full px-2.5 py-2 rounded-md text-[13px] transition-colors',
                  isMasterDataRoute
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 flex-shrink-0" />
                  <span>Master Data</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    masterDataOpen && "rotate-180"
                  )} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-3 mt-0.5 space-y-0.5 border-l border-border/40 pl-2">
              {masterDataItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* System - Collapsible Minimal */}
        <div className="mt-2 pt-2 border-t border-border/40">
          <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-between w-full px-2.5 py-2 rounded-md text-[13px] transition-colors',
                  isSystemRoute
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>System</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    systemOpen && "rotate-180"
                  )} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-3 mt-0.5 space-y-0.5 border-l border-border/40 pl-2">
              {systemItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Settings - Collapsible Minimal */}
        <div className="mt-2 pt-2 border-t border-border/40">
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-between w-full px-2.5 py-2 rounded-md text-[13px] transition-colors',
                  isSettingsRoute
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span>Settings</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    settingsOpen && "rotate-180"
                  )} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-3 mt-0.5 space-y-0.5 border-l border-border/40 pl-2">
              {settingsItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Footer - Minimal */}
      <div className="px-2 py-2 border-t border-border/50 space-y-1">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-accent/30">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium">Owner Admin</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 text-[12px] text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </>
  );
}

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { isOwnerAdmin, isLoading } = useIsOwnerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logoAuth } = usePlatformBranding();
  const platformLogo = logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth;

  useEffect(() => {
    if (!isLoading && !isOwnerAdmin) {
      navigate('/dashboard');
    }
  }, [isOwnerAdmin, isLoading, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOwnerAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={platformLogo} alt="MedFlowx" className="h-8 w-8 rounded-lg" />
          <div>
            <h1 className="font-bold text-sm">Owner Panel</h1>
          </div>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SidebarContentComponent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContentComponent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="max-w-7xl mx-auto py-4 px-4 md:py-6 md:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
