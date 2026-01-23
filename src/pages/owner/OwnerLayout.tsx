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
import { Separator } from '@/components/ui/separator';
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
      {/* Logo/Brand */}
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={platformLogo} alt="MedFlowx" className="h-10 w-10 rounded-lg" />
          <div>
            <h1 className="font-bold text-base md:text-lg">Owner Panel</h1>
            <p className="text-xs text-muted-foreground">Master Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 md:px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/owner'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Master Data Section - Collapsible */}
        <div className="mt-4 pt-4 border-t border-border">
          <Collapsible open={masterDataOpen} onOpenChange={setMasterDataOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isMasterDataRoute
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 flex-shrink-0" />
                  <span>Master Data</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    masterDataOpen && "rotate-180"
                  )} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 ml-4 space-y-1">
              {masterDataItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* System Section - Collapsible */}
        <div className="mt-4 pt-4 border-t border-border">
          <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isSystemRoute
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>System</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    systemOpen && "rotate-180"
                  )} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 ml-4 space-y-1">
              {systemItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Settings Section - Collapsible */}
        <div className="mt-4 pt-4 border-t border-border">
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isSettingsRoute
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span>Settings</span>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    settingsOpen && "rotate-180"
                  )} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 ml-4 space-y-1">
              {settingsItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Owner Admin</span>
        </div>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
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
