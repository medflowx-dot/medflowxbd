import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { DashboardHeader } from './DashboardHeader';
import { ImpersonationBanner } from './ImpersonationBanner';
import { SubscriptionBanner } from './SubscriptionBanner';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { useIsMobile } from '@/hooks/use-mobile';

export function DashboardLayout() {
  const isMobile = useIsMobile();

  // Render mobile layout for mobile devices
  if (isMobile) {
    return <MobileLayout />;
  }

  // Desktop layout
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
        <ImpersonationBanner />
        <SubscriptionBanner />
        <div className="flex flex-1 overflow-visible">
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-visible">
            <DashboardHeader />
            <main className="flex-1 p-3 sm:p-4 md:p-6 bg-muted/30 overflow-visible">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
