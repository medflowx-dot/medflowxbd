import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Suppliers() {
  const location = useLocation();
  const { t } = useLanguage();

  const supplierTabs = [
    { label: t.suppliers.supplierList, path: '/dashboard/suppliers' },
    { label: t.suppliers.stockShort, path: '/dashboard/suppliers/stock-short' },
    { label: t.suppliers.pending, path: '/dashboard/suppliers/pending' },
    { label: t.suppliers.ordered, path: '/dashboard/suppliers/ordered' },
    { label: t.suppliers.received, path: '/dashboard/suppliers/received' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 border-b pb-2 min-w-max">
          {supplierTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/dashboard/suppliers'}
              className={({ isActive }) => cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}