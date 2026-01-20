import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { usePlatformBranding } from '@/hooks/usePlatformBranding';
import logoAuthFallback from '@/assets/logo-auth.png';

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
  const { theme, setTheme } = useTheme();
  const { logoAuth } = usePlatformBranding();
  const platformLogo = logoAuth.startsWith('/src') ? logoAuthFallback : logoAuth;

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
    <header className="sticky top-0 z-40 mobile-header-gradient md:hidden safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-[60px]">
          {shouldShowBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 -ml-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Avatar
              className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all hover:ring-primary/40"
              onClick={handleProfileClick}
            >
              <AvatarImage src={profile?.pharmacy_logo || profile?.avatar_url || platformLogo} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
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
        <div className="flex items-center gap-0.5 min-w-[90px] justify-end">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 hover:bg-primary/10"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              className="h-9 w-9 hover:bg-primary/10"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {rightAction || (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="h-9 w-9 relative hover:bg-primary/10"
            >
              <Bell className="h-5 w-5" />
              {expiryAlerts > 0 && (
                <span className={cn(
                  "absolute top-0.5 right-0.5 h-4 w-4 rounded-full text-[10px] font-bold flex items-center justify-center",
                  "bg-destructive text-destructive-foreground shadow-lg",
                  "badge-animated"
                )}>
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
