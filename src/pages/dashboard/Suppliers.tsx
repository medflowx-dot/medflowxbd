import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Truck, ClipboardList, Package, CheckCircle, AlertCircle } from 'lucide-react';

export default function Suppliers() {
  const location = useLocation();
  const { t } = useLanguage();

  const supplierTabs = [
    { label: t.suppliers.supplierList, path: '/dashboard/suppliers', icon: Truck },
    { label: t.suppliers.stockShort, path: '/dashboard/suppliers/stock-short', icon: AlertCircle },
    { label: t.suppliers.pending, path: '/dashboard/suppliers/pending', icon: ClipboardList },
    { label: t.suppliers.ordered, path: '/dashboard/suppliers/ordered', icon: Package },
    { label: t.suppliers.received, path: '/dashboard/suppliers/received', icon: CheckCircle },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub-navigation tabs - scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex gap-1 sm:gap-1.5 border-b border-border/50 pb-2 sm:pb-3 min-w-max">
          {supplierTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path === '/dashboard/suppliers'}
                className={({ isActive }) => cn(
                  "px-2 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-sm font-medium rounded-md sm:rounded-lg transition-all duration-200 whitespace-nowrap flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1.5",
                  isActive 
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="leading-tight text-center sm:text-left">{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}
