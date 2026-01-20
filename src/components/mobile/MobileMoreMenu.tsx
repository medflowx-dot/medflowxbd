import { useNavigate } from 'react-router-dom';
import {
  Factory,
  Truck,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Layers,
  Clock,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  path: string;
  badge?: 'customerDues' | 'supplierDues';
}

const menuItems: MenuItem[] = [
  { id: 'manufacturers', labelKey: 'manufacturers', icon: Factory, path: '/dashboard/manufacturers' },
  { id: 'suppliers', labelKey: 'suppliers', icon: Truck, path: '/dashboard/suppliers', badge: 'supplierDues' },
  { id: 'batches', labelKey: 'batches', icon: Layers, path: '/dashboard/batches' },
  { id: 'dailyCash', labelKey: 'dailyCash', icon: Calendar, path: '/dashboard/daily-cash' },
  { id: 'customerDues', labelKey: 'customerDues', icon: Users, path: '/dashboard/customer-dues', badge: 'customerDues' },
  { id: 'expiry', labelKey: 'expiryMonitoring', icon: Clock, path: '/dashboard/expiry' },
  { id: 'reports', labelKey: 'reports', icon: FileText, path: '/dashboard/reports' },
  { id: 'settings', labelKey: 'settings', icon: Settings, path: '/dashboard/settings' },
];

interface MobileMoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMoreMenu({ open, onOpenChange }: MobileMoreMenuProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { data: badges } = useSidebarBadges();

  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      manufacturers: t.nav?.manufacturers || 'প্রস্তুতকারক',
      suppliers: t.nav?.suppliers || 'সরবরাহকারী',
      batches: t.nav?.batches || 'ব্যাচ',
      dailyCash: t.nav?.dailyCash || 'দৈনিক ক্যাশ',
      customerDues: t.nav?.customerDues || 'গ্রাহক বাকি',
      expiryMonitoring: t.nav?.expiryMonitor || 'মেয়াদ পর্যবেক্ষণ',
      reports: t.nav?.reports || 'রিপোর্ট',
      settings: t.nav?.settings || 'সেটিংস',
    };
    return labels[key] || key;
  };

  const getBadgeCount = (badge?: 'customerDues' | 'supplierDues') => {
    if (badge === 'customerDues') return badges?.customerDues || 0;
    if (badge === 'supplierDues') return badges?.supplierDues || 0;
    return 0;
  };

  const handleMenuClick = (path: string) => {
    onOpenChange(false);
    // Small delay for animation
    setTimeout(() => {
      navigate(path);
    }, 150);
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-lg font-semibold">
            আরও মেনু
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 py-2">
          <div className="grid grid-cols-3 gap-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const badgeCount = getBadgeCount(item.badge);

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
                    "bg-muted/50 hover:bg-muted transition-colors",
                    "active:scale-95 touch-manipulation"
                  )}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {badgeCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground text-center line-clamp-2">
                    {getLabel(item.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sign Out Button */}
          <div className="border-t border-border pt-4 pb-6">
            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center justify-center gap-3 p-4 rounded-xl",
                "bg-destructive/10 text-destructive",
                "hover:bg-destructive/20 transition-colors",
                "active:scale-95 touch-manipulation"
              )}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">সাইন আউট</span>
            </button>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
