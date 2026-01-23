import { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomTabs } from './MobileBottomTabs';
import { MobileFAB } from './MobileFAB';
import { MobileMoreMenu } from './MobileMoreMenu';
import { PullToRefresh } from './PullToRefresh';
import { ImpersonationBanner } from '@/components/dashboard/ImpersonationBanner';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';
import { ClipboardList, BookOpen, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Wrapper dialogs that can be controlled externally
import { QuickSaleDialog } from '@/components/sales/QuickSaleDialog';
import { AddMedicineDialog } from '@/components/medicines/AddMedicineDialog';
import { useMedicines } from '@/hooks/useMedicines';

export function MobileLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
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

  // Cache clearing handler
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Clear React Query cache
      queryClient.clear();
      
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      
      // Clear localStorage except auth token
      const supabaseAuthKey = Object.keys(localStorage).find(key => 
        key.startsWith('sb-') && key.endsWith('-auth-token')
      );
      const authToken = supabaseAuthKey ? localStorage.getItem(supabaseAuthKey) : null;
      
      localStorage.clear();
      
      if (supabaseAuthKey && authToken) {
        localStorage.setItem(supabaseAuthKey, authToken);
      }
      
      toast.success(t.settings?.cacheCleared || 'ক্যাশ সফলভাবে ক্লিয়ার হয়েছে');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error(t.settings?.cacheClearFailed || 'ক্যাশ ক্লিয়ার করতে ব্যর্থ');
    } finally {
      setIsClearing(false);
    }
  };

  const fabActions = [
    {
      id: 'stockShort',
      label: t.suppliers?.stockShort || 'শর্ট লিস্ট',
      icon: ClipboardList,
      onClick: () => navigate('/dashboard/suppliers/stock-short'),
      color: 'bg-primary text-primary-foreground',
    },
    {
      id: 'medicineInfo',
      label: t.nav?.medicineInfo || 'ঔষধ তথ্য',
      icon: BookOpen,
      onClick: () => navigate('/dashboard/medicine-info'),
      color: 'bg-info text-info-foreground',
    },
    {
      id: 'clearCache',
      label: t.settings?.clearCache || 'ক্যাশ ক্লিয়ার',
      icon: Trash2,
      onClick: handleClearCache,
      color: 'bg-destructive text-destructive-foreground',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background md:hidden">
      <ImpersonationBanner />
      <SubscriptionBanner />
      
      <MobileHeader />
      
      <PullToRefresh 
        onRefresh={handleRefresh}
        className="flex-1 pb-20 overflow-visible"
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
