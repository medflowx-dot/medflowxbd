import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  AlertTriangle,
  Users,
  Truck,
  Wallet,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShoppingCart,
  CreditCard,
  Receipt,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useRecentTransactions, Transaction } from '@/hooks/useRecentTransactions';
import { useSalesTrend } from '@/hooks/useSalesTrend';
import { useDueAlerts } from '@/hooks/useDueAlerts';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function DashboardHome() {
  const { data: stats, isLoading } = useDashboardStats();
  const subscription = useSubscriptionStatus();
  const { data: transactions, isLoading: transactionsLoading } = useRecentTransactions(5);
  const { data: salesTrend, isLoading: trendLoading } = useSalesTrend();
  const { data: dueAlerts, isLoading: dueLoading } = useDueAlerts(3);
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

  const trialDaysRemaining = subscription.daysRemaining || 0;

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'sale':
        return ShoppingCart;
      case 'due_collection':
        return CreditCard;
      case 'daily_cost':
        return Receipt;
      case 'supplier_payment':
        return Truck;
      default:
        return Receipt;
    }
  };

  const getTransactionStyle = (type: Transaction['type'], isIncome: boolean) => {
    if (isIncome) {
      return {
        bg: 'bg-success/10',
        iconBg: 'bg-success',
        text: 'text-success',
      };
    }
    return {
      bg: 'bg-destructive/10',
      iconBg: 'bg-destructive',
      text: 'text-destructive',
    };
  };

  const chartConfig = {
    amount: {
      label: t.dashboard.salesAmount,
      color: 'hsl(var(--success))',
    },
  };

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
        <CardHeader className="pb-2 bg-gradient-to-r from-warning/10 to-warning/5">
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

      {/* Sales Trend Chart & Due Alerts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales Trend Chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-success/10 to-success/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="icon-container-success p-2">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                {t.dashboard.salesTrend}
              </CardTitle>
            </div>
            <CardDescription>{t.dashboard.last7Days}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {trendLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="h-[160px] sm:h-[200px]">
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={salesTrend?.dailyData || []}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="dayShort" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis hide />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`৳${Number(value).toLocaleString()}`, t.dashboard.salesAmount]}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        fill="url(#salesGradient)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
                
                {/* Week Comparison */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">{t.dashboard.thisWeek}</p>
                    <p className="text-lg font-bold">৳{salesTrend?.thisWeekTotal?.toLocaleString() || 0}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
                    salesTrend?.isPositive 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  )}>
                    {salesTrend?.isPositive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {salesTrend?.percentChange || 0}%
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{t.dashboard.lastWeek}</p>
                    <p className="text-lg font-bold text-muted-foreground">৳{salesTrend?.lastWeekTotal?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Due Alerts */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-warning/10 to-warning/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="icon-container-warning p-2">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                {t.dashboard.dueAlerts}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {dueLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Dues */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-warning">
                    <Users className="h-4 w-4" />
                    {t.dashboard.customerDuesTitle}
                  </div>
                  <div className="space-y-2">
                    {dueAlerts?.topCustomers.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        {t.dashboard.noDues}
                      </p>
                    ) : (
                      dueAlerts?.topCustomers.map((customer) => (
                        <div 
                          key={customer.id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <span className="text-sm truncate max-w-[60%]">{customer.name}</span>
                          <span className="text-sm font-semibold text-warning">
                            ৳{customer.totalDue.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <Link to="/dashboard/customer-dues">
                      <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                        {t.dashboard.total}: ৳{dueAlerts?.totalCustomerDue?.toLocaleString() || 0}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Supplier Dues */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-info">
                    <Truck className="h-4 w-4" />
                    {t.dashboard.supplierDuesTitle}
                  </div>
                  <div className="space-y-2">
                    {dueAlerts?.topSuppliers.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        {t.dashboard.noDues}
                      </p>
                    ) : (
                      dueAlerts?.topSuppliers.map((supplier) => (
                        <div 
                          key={supplier.id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <span className="text-sm truncate max-w-[60%]">{supplier.name}</span>
                          <span className="text-sm font-semibold text-info">
                            ৳{supplier.totalDue.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <Link to="/dashboard/suppliers">
                      <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                        {t.dashboard.total}: ৳{dueAlerts?.totalSupplierDue?.toLocaleString() || 0}
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-info/10 to-info/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="icon-container-info p-2">
                <Clock className="h-4 w-4 text-white" />
              </div>
              {t.dashboard.recentTransactions}
            </CardTitle>
            <Link to="/dashboard/daily-cash">
              <Button variant="ghost" size="sm" className="gap-1">
                {t.dashboard.viewAll}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <CardDescription>{t.dashboard.todaysActivity}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t.dashboard.noTransactions}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions?.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const style = getTransactionStyle(transaction.type, transaction.isIncome);
                
                return (
                  <div 
                    key={transaction.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      style.bg
                    )}
                  >
                    <div className={cn("p-2 rounded-lg shrink-0", style.iconBg)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.time}</p>
                    </div>
                    <div className={cn("text-sm font-bold shrink-0", style.text)}>
                      {transaction.isIncome ? '+' : '-'}৳{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
