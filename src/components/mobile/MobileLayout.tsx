import { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomTabs } from './MobileBottomTabs';
import { MobileFAB } from './MobileFAB';
import { MobileMoreMenu } from './MobileMoreMenu';
import { PullToRefresh } from './PullToRefresh';
import { ImpersonationBanner } from '@/components/dashboard/ImpersonationBanner';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';
import { ShoppingCart, Package, Layers, Wallet } from 'lucide-react';
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
      id: 'quickSale',
      label: t.sales?.quickEntry || 'দ্রুত বিক্রয়',
      icon: ShoppingCart,
      onClick: () => navigate('/dashboard/sales'),
      color: 'bg-success text-success-foreground',
    },
    {
      id: 'addMedicine',
      label: t.medicines?.addMedicine || 'ওষুধ যোগ',
      icon: Package,
      onClick: () => navigate('/dashboard/medicines'),
      color: 'bg-info text-info-foreground',
    },
    {
      id: 'addBatch',
      label: t.batches?.addBatch || 'ব্যাচ যোগ',
      icon: Layers,
      onClick: () => navigate('/dashboard/batches'),
      color: 'bg-purple text-purple-foreground',
    },
    {
      id: 'addCost',
      label: t.dailyCash?.addCost || 'খরচ যোগ',
      icon: Wallet,
      onClick: () => navigate('/dashboard/daily-cash'),
      color: 'bg-warning text-warning-foreground',
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
