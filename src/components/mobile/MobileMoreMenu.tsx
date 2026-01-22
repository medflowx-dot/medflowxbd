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
  Bell,
  BookOpen,
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
  badge?: 'customerDues' | 'supplierDues' | 'expiryAlerts';
  iconClass?: string;
}

const menuItems: MenuItem[] = [
  { id: 'manufacturers', labelKey: 'manufacturers', icon: Factory, path: '/dashboard/manufacturers', iconClass: 'icon-container-info' },
  { id: 'suppliers', labelKey: 'suppliers', icon: Truck, path: '/dashboard/suppliers', badge: 'supplierDues', iconClass: 'icon-container-info' },
  { id: 'batches', labelKey: 'batches', icon: Layers, path: '/dashboard/batches', iconClass: 'icon-container-primary' },
  { id: 'dailyCash', labelKey: 'dailyCash', icon: Calendar, path: '/dashboard/daily-cash', iconClass: 'icon-container-success' },
  { id: 'customerDues', labelKey: 'customerDues', icon: Users, path: '/dashboard/customer-dues', badge: 'customerDues', iconClass: 'icon-container-warning' },
  { id: 'alerts', labelKey: 'alerts', icon: Bell, path: '/dashboard/alerts', badge: 'expiryAlerts', iconClass: 'icon-container-danger' },
  { id: 'expiry', labelKey: 'expiryMonitoring', icon: Clock, path: '/dashboard/expiry', iconClass: 'icon-container-danger' },
  { id: 'medicineInfo', labelKey: 'medicineInfo', icon: BookOpen, path: '/dashboard/medicine-info', iconClass: 'icon-container-primary' },
  { id: 'reports', labelKey: 'reports', icon: FileText, path: '/dashboard/reports', iconClass: 'icon-container-primary' },
  { id: 'settings', labelKey: 'settings', icon: Settings, path: '/dashboard/settings', iconClass: 'bg-muted' },
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
      alerts: t.nav?.alerts || 'এলার্ট',
      expiryMonitoring: t.nav?.expiryMonitor || 'মেয়াদ পর্যবেক্ষণ',
      medicineInfo: t.nav?.medicineInfo || 'ঔষধ তথ্য',
      reports: t.nav?.reports || 'রিপোর্ট',
      settings: t.nav?.settings || 'সেটিংস',
    };
    return labels[key] || key;
  };

  const menuTitle = t.nav?.more || 'More';

  const getBadgeCount = (badge?: 'customerDues' | 'supplierDues' | 'expiryAlerts') => {
    if (badge === 'customerDues') return badges?.customerDues || 0;
    if (badge === 'supplierDues') return badges?.supplierDues || 0;
    if (badge === 'expiryAlerts') return badges?.expiryAlerts || 0;
    return 0;
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const handleSignOut = async () => {
    onOpenChange(false);
    await signOut();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="border-b border-border py-3">
          <DrawerTitle className="text-base font-semibold">
            {menuTitle}
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-3 py-2">
          <div className="grid grid-cols-4 gap-2 py-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const badgeCount = getBadgeCount(item.badge);

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg",
                    "bg-muted/30 hover:bg-muted/60 transition-all duration-100",
                    "active:scale-95 touch-manipulation"
                  )}
                >
                  <div className="relative">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", item.iconClass)}>
                      <Icon className={cn(
                        "h-4 w-4",
                        item.iconClass === 'bg-muted' ? "text-muted-foreground" : "text-white"
                      )} />
                    </div>
                    {badgeCount > 0 && (
                      <span className={cn(
                        "absolute -top-1 -right-1 h-4 w-4 rounded-full text-[8px] font-bold flex items-center justify-center",
                        "bg-destructive text-destructive-foreground"
                      )}>
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-1">
                    {getLabel(item.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sign Out Button */}
          <div className="border-t border-border pt-3 pb-4">
            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg",
                "bg-destructive/10 text-destructive",
                "hover:bg-destructive/20 transition-all duration-100",
                "active:scale-95 touch-manipulation"
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">সাইন আউট</span>
            </button>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
