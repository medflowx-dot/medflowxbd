import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Layers, Wallet, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  { id: 'batches', labelKey: 'batches', icon: Layers, path: '/dashboard/batches' },
  { id: 'dailyCash', labelKey: 'dailyCash', icon: Wallet, path: '/dashboard/daily-cash' },
  { id: 'more', labelKey: 'more', icon: Menu, action: 'more' },
];

interface MobileBottomTabsProps {
  onMoreClick: () => void;
}

export function MobileBottomTabs({ onMoreClick }: MobileBottomTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
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
      batches: t.nav?.batches || 'ব্যাচ',
      dailyCash: t.nav?.dailyCash || 'ক্যাশ',
      more: 'আরও',
    };
    return labels[key] || key;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mobile-tab-glass border-t border-border/50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

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
              {/* Active Background Pill */}
              {active && (
                <div className="absolute inset-x-2 top-1 bottom-1 mobile-tab-active rounded-xl -z-10" />
              )}
              
              <div className="relative">
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  active && "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    active && "scale-110"
                  )} />
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                active && "font-semibold text-primary"
              )}>
                {getLabel(tab.labelKey)}
              </span>
              
              {/* Active Indicator Line */}
              {active && (
                <div className="absolute bottom-0 w-12 h-0.5 rounded-full bg-gradient-to-r from-primary to-primary/60" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
