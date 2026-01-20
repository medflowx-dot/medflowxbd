import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  FileText,
  TrendingUp,
  AlertTriangle,
  Users,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function DashboardHome() {
  const { data: stats, isLoading } = useDashboardStats();
  const subscription = useSubscriptionStatus();
  const { t } = useLanguage();

  const quickStats = [
    { 
      label: t.dashboard.todaysSales, 
      value: `৳${stats?.todaysSales.toFixed(0) || '0'}`, 
      icon: TrendingUp, 
      cardClass: 'stat-card-sales',
      iconClass: 'icon-container-success',
      valueClass: 'text-green-600 dark:text-green-400'
    },
    { 
      label: t.dashboard.todaysCosts, 
      value: `৳${stats?.todaysCosts.toFixed(0) || '0'}`, 
      icon: Wallet, 
      cardClass: 'stat-card-expense',
      iconClass: 'icon-container-danger',
      valueClass: 'text-red-600 dark:text-red-400'
    },
    { 
      label: t.dashboard.customerDues, 
      value: `৳${stats?.totalCustomerDues.toFixed(0) || '0'}`, 
      icon: Users, 
      cardClass: 'stat-card-due',
      iconClass: 'icon-container-warning',
      valueClass: 'text-amber-600 dark:text-amber-400'
    },
    { 
      label: t.dashboard.supplierDues, 
      value: `৳${stats?.totalSupplierDues.toFixed(0) || '0'}`, 
      icon: Truck, 
      cardClass: 'stat-card-info',
      iconClass: 'icon-container-info',
      valueClass: 'text-blue-600 dark:text-blue-400'
    },
  ];

  const expiryStats = [
    { label: t.dashboard.expired, value: stats?.expiredItems || 0, badgeClass: 'expiry-badge-critical' },
    { label: t.dashboard.days30, value: stats?.expiringIn30Days || 0, badgeClass: 'expiry-badge-warning' },
    { label: t.dashboard.days60, value: stats?.expiringIn60Days || 0, badgeClass: 'expiry-badge-caution' },
    { label: t.dashboard.days90, value: stats?.expiringIn90Days || 0, badgeClass: 'expiry-badge-safe' },
  ];

  const modules = [
    { icon: Package, title: t.dashboard.medicines, description: t.dashboard.medicinesDesc, href: '/dashboard/medicines', iconClass: 'icon-container-info' },
    { icon: ShoppingCart, title: t.dashboard.sales, description: t.dashboard.salesDesc, href: '/dashboard/sales', iconClass: 'icon-container-success' },
    { icon: Users, title: t.dashboard.customerDuesTitle, description: t.dashboard.customerDuesDesc, href: '/dashboard/customer-dues', iconClass: 'icon-container-warning' },
    { icon: Truck, title: t.dashboard.suppliers, description: t.dashboard.suppliersDesc, href: '/dashboard/suppliers', iconClass: 'icon-container-info' },
    { icon: FileText, title: t.dashboard.reports, description: t.dashboard.reportsDesc, href: '/dashboard/reports', iconClass: 'icon-container-primary' },
  ];

  const trialDaysRemaining = subscription.daysRemaining || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1">
          {t.dashboard.welcome}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
        {quickStats.map((stat) => (
          <Card key={stat.label} className={cn("transition-all duration-300 hover:shadow-lg", stat.cardClass)}>
            <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
              <div className={cn("shrink-0", stat.iconClass)}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <stat.icon className="h-4 w-4 text-white" />
                )}
              </div>
              <CardDescription className="text-xs sm:text-sm font-medium">{stat.label}</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className={cn("text-xl sm:text-2xl font-bold", stat.valueClass)}>
                {isLoading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expiry Overview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="icon-container-warning p-2">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              {t.dashboard.expiryAlerts}
            </CardTitle>
            <Link to="/dashboard/expiry">
              <Button variant="ghost" size="sm" className="gap-1">
                {t.dashboard.viewAll}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {expiryStats.map((stat) => (
              <div key={stat.label} className={stat.badgeClass}>
                <div className="text-lg sm:text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
                <div className="text-xs font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">{t.dashboard.quickAccess}</h2>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {modules.map((module) => (
            <Link key={module.title} to={module.href}>
              <Card className="quick-access-card cursor-pointer group h-full">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("shrink-0 group-hover:scale-110 transition-transform", module.iconClass)}>
                      <module.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-1">{module.description}</CardDescription>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Trial Banner */}
      {subscription?.isTrial && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="py-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-lg">{t.dashboard.trialTitle}</h3>
                <p className="text-muted-foreground text-sm">
                  {trialDaysRemaining} {t.dashboard.trialDesc}
                </p>
              </div>
              <Link to="/billing">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  {t.dashboard.upgradeNow}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
