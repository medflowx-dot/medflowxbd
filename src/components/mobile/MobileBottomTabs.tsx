import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Package, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
import { useLanguage } from '@/contexts/LanguageContext';

interface TabItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  path?: string;
  action?: 'more';
}

const tabs: TabItem[] = [
  { id: 'home', labelKey: 'home', icon: Home, path: '/dashboard' },
  { id: 'sales', labelKey: 'sales', icon: ShoppingCart, path: '/dashboard/sales' },
  { id: 'medicines', labelKey: 'medicines', icon: Package, path: '/dashboard/medicines' },
  { id: 'alerts', labelKey: 'alerts', icon: Bell, path: '/dashboard/alerts' },
  { id: 'more', labelKey: 'more', icon: Menu, action: 'more' },
];

interface MobileBottomTabsProps {
  onMoreClick: () => void;
}

export function MobileBottomTabs({ onMoreClick }: MobileBottomTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: badges } = useSidebarBadges();
  const { t } = useLanguage();

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (tab: TabItem) => {
    if (tab.action === 'more') {
      onMoreClick();
    } else if (tab.path) {
      navigate(tab.path);
    }
  };

  const getLabel = (key: string) => {
    const labels: Record<string, string> = {
      home: t.nav?.dashboard || 'হোম',
      sales: t.nav?.sales || 'বিক্রয়',
      medicines: t.nav?.medicines || 'ওষুধ',
      alerts: t.nav?.alerts || 'এলার্ট',
      more: 'আরও',
    };
    return labels[key] || key;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          const showBadge = tab.id === 'alerts' && (badges?.expiryAlerts || 0) > 0;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 relative",
                "active:scale-95 touch-manipulation",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active && "scale-110"
                )} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                    {(badges?.expiryAlerts || 0) > 99 ? '99+' : badges?.expiryAlerts}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                active && "font-semibold"
              )}>
                {getLabel(tab.labelKey)}
              </span>
              {active && (
                <div className="absolute bottom-1 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
