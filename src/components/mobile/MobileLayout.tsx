import { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomTabs } from './MobileBottomTabs';
import { MobileFAB } from './MobileFAB';
import { MobileMoreMenu } from './MobileMoreMenu';
import { PullToRefresh } from './PullToRefresh';
import { ImpersonationBanner } from '@/components/dashboard/ImpersonationBanner';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';
import { Factory, Truck, Users, Clock, FileText, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';

// Wrapper dialogs that can be controlled externally
import { QuickSaleDialog } from '@/components/sales/QuickSaleDialog';
import { AddMedicineDialog } from '@/components/medicines/AddMedicineDialog';
import { useMedicines } from '@/hooks/useMedicines';

export function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { medicines } = useMedicines();

  // Pull-to-refresh handler - invalidates relevant queries based on current page
  const handleRefresh = useCallback(async () => {
    const path = location.pathname;
    
    // Determine which queries to invalidate based on current route
    const queriesToInvalidate: string[] = [];
    
    if (path === '/dashboard' || path === '/dashboard/') {
      queriesToInvalidate.push(
        'dashboard-stats',
        'recent-transactions',
        'sales-trend',
        'due-alerts'
      );
    } else if (path.includes('/medicines')) {
      queriesToInvalidate.push('medicines', 'medicine-batches');
    } else if (path.includes('/sales')) {
      queriesToInvalidate.push('sales', 'daily-cash');
    } else if (path.includes('/suppliers')) {
      queriesToInvalidate.push('suppliers', 'supplier-orders');
    } else if (path.includes('/customer-dues')) {
      queriesToInvalidate.push('customers', 'customer-payments');
    } else if (path.includes('/daily-cash')) {
      queriesToInvalidate.push('daily-cash', 'opening-cash');
    } else if (path.includes('/alerts') || path.includes('/expiry')) {
      queriesToInvalidate.push('expiry-alerts', 'medicine-batches');
    } else if (path.includes('/batches')) {
      queriesToInvalidate.push('medicine-batches', 'medicines');
    } else if (path.includes('/manufacturers')) {
      queriesToInvalidate.push('manufacturers');
    } else if (path.includes('/reports')) {
      queriesToInvalidate.push('reports', 'sales', 'customers', 'suppliers');
    }
    
    // Always invalidate these core queries
    queriesToInvalidate.push('subscription-status', 'profile');
    
    // Invalidate all specified queries
    await Promise.all(
      queriesToInvalidate.map(key => 
        queryClient.invalidateQueries({ queryKey: [key] })
      )
    );
    
    // Small delay to ensure UI feedback
    await new Promise(resolve => setTimeout(resolve, 300));
  }, [location.pathname, queryClient]);

  const fabActions = [
    {
      id: 'manufacturers',
      label: t.nav?.manufacturers || 'প্রস্তুতকারক',
      icon: Factory,
      onClick: () => navigate('/dashboard/manufacturers'),
      color: 'bg-info text-info-foreground',
    },
    {
      id: 'suppliers',
      label: t.nav?.suppliers || 'সরবরাহকারী',
      icon: Truck,
      onClick: () => navigate('/dashboard/suppliers'),
      color: 'bg-primary text-primary-foreground',
    },
    {
      id: 'customerDues',
      label: t.nav?.customerDues || 'গ্রাহক বাকি',
      icon: Users,
      onClick: () => navigate('/dashboard/customer-dues'),
      color: 'bg-warning text-warning-foreground',
    },
    {
      id: 'expiry',
      label: t.nav?.expiryMonitor || 'মেয়াদ পর্যবেক্ষণ',
      icon: Clock,
      onClick: () => navigate('/dashboard/expiry'),
      color: 'bg-destructive text-destructive-foreground',
    },
    {
      id: 'reports',
      label: t.nav?.reports || 'রিপোর্ট',
      icon: FileText,
      onClick: () => navigate('/dashboard/reports'),
      color: 'bg-primary text-primary-foreground',
    },
    {
      id: 'settings',
      label: t.nav?.settings || 'সেটিংস',
      icon: Settings,
      onClick: () => navigate('/dashboard/settings'),
      color: 'bg-muted text-muted-foreground',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background md:hidden">
      <ImpersonationBanner />
      <SubscriptionBanner />
      
      <MobileHeader />
      
      <PullToRefresh 
        onRefresh={handleRefresh}
        className="flex-1 pb-20"
        pullText="টানুন রিফ্রেশ করতে"
        releaseText="ছেড়ে দিন"
        refreshingText="রিফ্রেশ হচ্ছে..."
      >
        <div className="p-4">
          <Outlet />
        </div>
      </PullToRefresh>

      <MobileFAB actions={fabActions} />
      <MobileBottomTabs onMoreClick={() => setMoreMenuOpen(true)} />
      <MobileMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
    </div>
  );
}
