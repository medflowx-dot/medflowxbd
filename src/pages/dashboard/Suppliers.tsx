import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const supplierTabs = [
  { label: 'Supplier List', path: '/dashboard/suppliers' },
  { label: 'Stock Short', path: '/dashboard/suppliers/stock-short' },
  { label: 'Pending', path: '/dashboard/suppliers/pending' },
  { label: 'Ordered', path: '/dashboard/suppliers/ordered' },
  { label: 'Received', path: '/dashboard/suppliers/received' },
];

export default function Suppliers() {
  const location = useLocation();

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
