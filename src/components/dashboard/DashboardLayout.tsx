import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { DashboardHeader } from './DashboardHeader';
import { ImpersonationBanner } from './ImpersonationBanner';

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <ImpersonationBanner />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-1">
            <DashboardHeader />
            <main className="flex-1 p-4 sm:p-6 bg-muted/30">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
