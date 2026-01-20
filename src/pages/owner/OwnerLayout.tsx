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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import logoAuth from '@/assets/logo-auth.png';

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
];

const systemItems = [
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
  {
    title: 'Settings',
    href: '/owner/settings',
    icon: Settings,
  },
];

// Sidebar content component to reuse in both desktop and mobile
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
          <img src={logoAuth} alt="MedFlowx" className="h-10 w-10 rounded-lg" />
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
        
        {/* Master Data Section */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Database className="h-3 w-3" />
            Master Data
          </div>
          <nav className="space-y-1 mt-1">
            {masterDataItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
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
        </div>
        
        {/* System Section */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Settings className="h-3 w-3" />
            System
          </div>
          <nav className="space-y-1 mt-1">
            {systemItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
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
          <img src={logoAuth} alt="MedFlowx" className="h-8 w-8 rounded-lg" />
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
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
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
