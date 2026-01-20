import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  onSearchClick?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({
  title,
  showBack,
  showSearch,
  onSearchClick,
  rightAction,
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useProfile();
  const { data: badges } = useSidebarBadges();
  const { t } = useLanguage();

  // Determine if we should show back button
  const shouldShowBack = showBack ?? location.pathname !== '/dashboard';

  // Get page title based on route
  const getPageTitle = () => {
    if (title) return title;
    
    const routeTitles: Record<string, string> = {
      '/dashboard': profile?.pharmacy_name || t.nav?.dashboard || 'ড্যাশবোর্ড',
      '/dashboard/sales': t.nav?.sales || 'বিক্রয়',
      '/dashboard/medicines': t.nav?.medicines || 'ওষুধ',
      '/dashboard/manufacturers': t.nav?.manufacturers || 'প্রস্তুতকারক',
      '/dashboard/suppliers': t.nav?.suppliers || 'সরবরাহকারী',
      '/dashboard/batches': t.nav?.batches || 'ব্যাচ',
      '/dashboard/daily-cash': t.nav?.dailyCash || 'দৈনিক ক্যাশ',
      '/dashboard/customer-dues': t.nav?.customerDues || 'গ্রাহক বাকি',
      '/dashboard/reports': t.nav?.reports || 'রিপোর্ট',
      '/dashboard/alerts': t.nav?.alerts || 'এলার্ট',
      '/dashboard/expiry': t.nav?.expiryMonitor || 'মেয়াদ',
      '/dashboard/settings': t.nav?.settings || 'সেটিংস',
    };

    // Check for exact match first, then partial match
    if (routeTitles[location.pathname]) {
      return routeTitles[location.pathname];
    }

    // Check for partial matches
    for (const [route, titleText] of Object.entries(routeTitles)) {
      if (location.pathname.startsWith(route) && route !== '/dashboard') {
        return titleText;
      }
    }

    return profile?.pharmacy_name || 'MedFlowx';
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProfileClick = () => {
    navigate('/dashboard/settings');
  };

  const handleNotificationClick = () => {
    navigate('/dashboard/alerts');
  };

  const expiryAlerts = badges?.expiryAlerts || 0;

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border md:hidden safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-[60px]">
          {shouldShowBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Avatar
              className="h-8 w-8 cursor-pointer"
              onClick={handleProfileClick}
            >
              <AvatarImage src={profile?.pharmacy_logo || profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {profile?.pharmacy_name?.charAt(0) || profile?.full_name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Center - Title */}
        <h1 className="text-base font-semibold text-foreground truncate max-w-[180px]">
          {getPageTitle()}
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-1 min-w-[60px] justify-end">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className="h-9 w-9"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {rightAction || (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="h-9 w-9 relative"
            >
              <Bell className="h-5 w-5" />
              {expiryAlerts > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  {expiryAlerts > 9 ? '9+' : expiryAlerts}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
