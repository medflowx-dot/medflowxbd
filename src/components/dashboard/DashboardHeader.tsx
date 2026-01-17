import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useProfile } from '@/hooks/useProfile';
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
import { LogOut, User, Bell, Shield, UserCog, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { role, isLoading } = usePermissions();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';

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
      
      {/* Pharmacy Name & Role Indicator */}
      <div className="hidden md:flex items-center gap-3 ml-2">
        {profile?.pharmacy_name && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{profile.pharmacy_name}</span>
          </div>
        )}
        {getRoleBadge()}
      </div>
      
      <div className="flex-1" />

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
      </Button>

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
              {profile?.pharmacy_name && (
                <div className="flex items-center gap-2 md:hidden">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm font-medium leading-none">{profile.pharmacy_name}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{profile?.full_name || 'Account'}</p>
                <span className="md:hidden">{getRoleBadge()}</span>
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
