import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useProfile } from '@/hooks/useProfile';
import { useExpiryAlerts } from '@/hooks/useMedicines';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCustomerDuesSummary } from '@/hooks/useCustomerDues';
import { useSupplierDuesSummary } from '@/hooks/useSuppliers';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Bell, Shield, UserCog, Users, AlertTriangle, Clock, Wallet, Truck, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { role, isLoading } = usePermissions();
  const { data: profile } = useProfile();
  const { totalAlerts, expired, expiring30 } = useExpiryAlerts();
  const { data: stats } = useDashboardStats();
  const { data: customerDuesData } = useCustomerDuesSummary();
  const { data: supplierDuesData } = useSupplierDuesSummary();
  const { checkAndPlaySound } = useNotificationSound();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success(t.header.signedOutSuccess);
    navigate('/');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  
  const customersWithDue = customerDuesData?.customersWithDue || 0;
  const totalCustomerDues = customerDuesData?.totalDue || 0;
  const suppliersWithDue = supplierDuesData?.suppliersWithDue || 0;
  const totalSupplierDues = supplierDuesData?.totalDue || 0;
  const totalNotifications = totalAlerts + (customersWithDue > 0 ? 1 : 0) + (suppliersWithDue > 0 ? 1 : 0);

  // Play sound when notifications increase
  useEffect(() => {
    checkAndPlaySound(totalNotifications);
  }, [totalNotifications, checkAndPlaySound]);

  const getRoleBadge = () => {
    if (isLoading) return null;
    
    switch (role) {
      case 'owner_admin':
        return (
          <Badge variant="destructive" className="gap-1">
            <Shield className="h-3 w-3" />
            {t.roles.owner}
          </Badge>
        );
      case 'client_admin':
        return (
          <Badge variant="default" className="gap-1">
            <UserCog className="h-3 w-3" />
            {t.roles.admin}
          </Badge>
        );
      case 'client_staff':
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {t.roles.staff}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'owner_admin':
        return t.roles.ownerAdmin;
      case 'client_admin':
        return t.roles.pharmacyAdmin;
      case 'client_staff':
        return t.roles.staffMember;
      default:
        return t.roles.user;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="-ml-2" />
      
      <div className="flex-1" />

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Theme Toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="relative"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Notification Bell with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                {totalNotifications > 99 ? '99+' : totalNotifications}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>{t.header.notifications}</span>
            {totalNotifications > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalNotifications} {t.header.alerts}
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {totalNotifications === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t.header.noAlerts}
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {/* Expired Medicines */}
                {expired.length > 0 && (
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => navigate('/dashboard/expiry')}
                  >
                    <div className="rounded-full bg-destructive/10 p-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{t.notifications.expiredMedicines}</p>
                      <p className="text-xs text-muted-foreground">
                        {expired.length} {expired.length > 1 ? t.notifications.batchesExpired : t.notifications.batchExpired}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {t.notifications.urgent}
                    </Badge>
                  </DropdownMenuItem>
                )}

                {/* Expiring in 30 Days */}
                {expiring30.length > 0 && (
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => navigate('/dashboard/expiry')}
                  >
                    <div className="rounded-full bg-orange-500/10 p-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{t.notifications.expiringSoon}</p>
                      <p className="text-xs text-muted-foreground">
                        {expiring30.length} {expiring30.length > 1 ? t.notifications.batchesExpiring : t.notifications.batchExpiring}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                      {t.notifications.warning}
                    </Badge>
                  </DropdownMenuItem>
                )}

                {/* Customer Dues */}
                {customersWithDue > 0 && (
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => navigate('/dashboard/customer-dues')}
                  >
                    <div className="rounded-full bg-blue-500/10 p-2">
                      <Wallet className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{t.notifications.customerDues}</p>
                      <p className="text-xs text-muted-foreground">
                        {customersWithDue} {customersWithDue > 1 ? t.notifications.customersOwe : t.notifications.customerOwe} ৳{totalCustomerDues.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">
                      {t.notifications.collect}
                    </Badge>
                  </DropdownMenuItem>
                )}

                {/* Supplier Dues */}
                {suppliersWithDue > 0 && (
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => navigate('/dashboard/suppliers')}
                  >
                    <div className="rounded-full bg-purple-500/10 p-2">
                      <Truck className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{t.notifications.supplierDues}</p>
                      <p className="text-xs text-muted-foreground">
                        {suppliersWithDue} {suppliersWithDue > 1 ? t.notifications.suppliersOwed : t.notifications.supplierOwed} ৳{totalSupplierDues.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-purple-500 text-purple-500">
                      {t.notifications.pay}
                    </Badge>
                  </DropdownMenuItem>
                )}
              </div>
            )}
          </ScrollArea>
          {totalNotifications > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-center justify-center text-primary text-sm font-medium cursor-pointer"
                onClick={() => navigate('/dashboard/alerts')}
              >
                {t.header.viewAllAlerts}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{profile?.full_name || 'Account'}</p>
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {getRoleLabel()}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
            <User className="mr-2 h-4 w-4" />
            {t.header.profileSettings}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {t.header.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
