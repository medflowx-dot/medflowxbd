import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useProfile } from '@/hooks/useProfile';
import { useExpiryAlerts } from '@/hooks/useMedicines';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Bell, Shield, UserCog, Users, AlertTriangle, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { role, isLoading } = usePermissions();
  const { data: profile } = useProfile();
  const { totalAlerts, expired, expiring30 } = useExpiryAlerts();
  const { data: stats } = useDashboardStats();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  
  const lowStockCount = stats?.lowStockCount || 0;
  const totalNotifications = totalAlerts + lowStockCount;

  const getRoleBadge = () => {
    if (isLoading) return null;
    
    switch (role) {
      case 'owner_admin':
        return (
          <Badge variant="destructive" className="gap-1">
            <Shield className="h-3 w-3" />
            Owner
          </Badge>
        );
      case 'client_admin':
        return (
          <Badge variant="default" className="gap-1">
            <UserCog className="h-3 w-3" />
            Admin
          </Badge>
        );
      case 'client_staff':
        return (
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Staff
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'owner_admin':
        return 'Owner Admin';
      case 'client_admin':
        return 'Pharmacy Admin';
      case 'client_staff':
        return 'Staff Member';
      default:
        return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="-ml-2" />
      
      <div className="flex-1" />

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
            <span>Notifications</span>
            {totalNotifications > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalNotifications} alerts
              </Badge>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {totalNotifications === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No alerts at this time
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {/* Expired Medicines */}
                {expired.length > 0 && (
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => navigate('/dashboard/expiry-monitoring')}
                  >
                    <div className="rounded-full bg-destructive/10 p-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Expired Medicines</p>
                      <p className="text-xs text-muted-foreground">
                        {expired.length} batch{expired.length > 1 ? 'es' : ''} expired
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  </DropdownMenuItem>
                )}

                {/* Expiring in 30 Days */}
                {expiring30.length > 0 && (
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => navigate('/dashboard/expiry-monitoring')}
                  >
                    <div className="rounded-full bg-orange-500/10 p-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Expiring Soon</p>
                      <p className="text-xs text-muted-foreground">
                        {expiring30.length} batch{expiring30.length > 1 ? 'es' : ''} expiring in 30 days
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                      Warning
                    </Badge>
                  </DropdownMenuItem>
                )}

                {/* Low Stock */}
                {lowStockCount > 0 && (
                  <DropdownMenuItem 
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => navigate('/dashboard/stock-short')}
                  >
                    <div className="rounded-full bg-yellow-500/10 p-2">
                      <Package className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Low Stock Alert</p>
                      <p className="text-xs text-muted-foreground">
                        {lowStockCount} medicine{lowStockCount > 1 ? 's' : ''} below minimum level
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
                      Restock
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
                View All Alerts
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
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
