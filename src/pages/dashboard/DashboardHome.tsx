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
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardHome() {
  const { data: stats, isLoading } = useDashboardStats();
  const subscription = useSubscriptionStatus();
  const { t } = useLanguage();

  const quickStats = [
    { label: t.dashboard.todaysSales, value: `৳${stats?.todaysSales.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'text-green-600' },
    { label: t.dashboard.todaysCosts, value: `৳${stats?.todaysCosts.toFixed(2) || '0.00'}`, icon: Wallet, color: 'text-red-600' },
    { label: t.dashboard.customerDues, value: `৳${stats?.totalCustomerDues.toFixed(0) || '0'}`, icon: Users, color: 'text-amber-600' },
    { label: t.dashboard.supplierDues, value: `৳${stats?.totalSupplierDues.toFixed(0) || '0'}`, icon: Truck, color: 'text-purple-600' },
  ];

  const expiryStats = [
    { label: t.dashboard.expired, value: stats?.expiredItems || 0, color: 'text-red-600 bg-red-50' },
    { label: t.dashboard.days30, value: stats?.expiringIn30Days || 0, color: 'text-orange-600 bg-orange-50' },
    { label: t.dashboard.days60, value: stats?.expiringIn60Days || 0, color: 'text-yellow-600 bg-yellow-50' },
    { label: t.dashboard.days90, value: stats?.expiringIn90Days || 0, color: 'text-blue-600 bg-blue-50' },
  ];

  const modules = [
    { icon: Package, title: t.dashboard.medicines, description: t.dashboard.medicinesDesc, href: '/dashboard/medicines', color: 'bg-blue-500' },
    { icon: ShoppingCart, title: t.dashboard.sales, description: t.dashboard.salesDesc, href: '/dashboard/sales', color: 'bg-green-500' },
    { icon: Users, title: t.dashboard.customerDuesTitle, description: t.dashboard.customerDuesDesc, href: '/dashboard/customer-dues', color: 'bg-amber-500' },
    { icon: Truck, title: t.dashboard.suppliers, description: t.dashboard.suppliersDesc, href: '/dashboard/suppliers', color: 'bg-purple-500' },
    { icon: FileText, title: t.dashboard.reports, description: t.dashboard.reportsDesc, href: '/dashboard/reports', color: 'bg-cyan-500' },
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.label}</CardDescription>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <stat.icon className={`h-4 w-4 ${stat.color}`} />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expiry Overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t.dashboard.expiryAlerts}
            </CardTitle>
            <Link to="/dashboard/expiry">
              <Button variant="ghost" size="sm">{t.dashboard.viewAll}</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {expiryStats.map((stat) => (
              <div key={stat.label} className={`text-center p-2 sm:p-3 rounded-lg ${stat.color}`}>
                <div className="text-lg sm:text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
                <div className="text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4">{t.dashboard.quickAccess}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.title} to={module.href}>
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${module.color} text-white group-hover:scale-110 transition-transform`}>
                      <module.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Trial Banner */}
      {subscription?.isTrial && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-lg">{t.dashboard.trialTitle}</h3>
                <p className="text-muted-foreground text-sm">
                  {trialDaysRemaining} {t.dashboard.trialDesc}
                </p>
              </div>
              <Link to="/billing">
                <Button>{t.dashboard.upgradeNow}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
