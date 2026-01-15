import { useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
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
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
    title: 'Payments',
    href: '/owner/payments',
    icon: DollarSign,
  },
  {
    title: 'Pricing Plans',
    href: '/owner/pricing',
    icon: FileText,
  },
  {
    title: 'System Review',
    href: '/owner/system-review',
    icon: Activity,
  },
  {
    title: 'CMS Manager',
    href: '/owner/cms',
    icon: Globe,
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

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isOwnerAdmin, isLoading } = useIsOwnerAdmin();

  useEffect(() => {
    if (!isLoading && !isOwnerAdmin) {
      navigate('/dashboard');
    }
  }, [isOwnerAdmin, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

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
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-dark">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Owner Panel</h1>
              <p className="text-xs text-muted-foreground">Master Control</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/owner'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl py-6 px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
