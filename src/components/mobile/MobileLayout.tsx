import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { MobileBottomTabs } from './MobileBottomTabs';
import { MobileFAB } from './MobileFAB';
import { MobileMoreMenu } from './MobileMoreMenu';
import { ImpersonationBanner } from '@/components/dashboard/ImpersonationBanner';
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner';
import { ShoppingCart, Package, Layers, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Wrapper dialogs that can be controlled externally
import { QuickSaleDialog } from '@/components/sales/QuickSaleDialog';
import { AddMedicineDialog } from '@/components/medicines/AddMedicineDialog';
import { useMedicines } from '@/hooks/useMedicines';

export function MobileLayout() {
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { medicines } = useMedicines();

  // For FAB actions, we render the dialog triggers inside FAB actions
  // Instead of controlled dialogs, we'll use navigation or render triggers

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
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      <MobileFAB actions={fabActions} />
      <MobileBottomTabs onMoreClick={() => setMoreMenuOpen(true)} />
      <MobileMoreMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen} />
    </div>
  );
}
