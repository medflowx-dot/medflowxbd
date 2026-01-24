import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  AlertTriangle,
  Users,
  Truck,
  Wallet,
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
import {
  StatCardsSkeleton,
  ExpiryStatsSkeleton,
  ChartSkeleton,
  DueAlertsSkeleton,
  TransactionsListSkeleton
} from '@/components/ui/skeletons';

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
      valueClass: 'text-success'
    },
    { 
      label: t.dashboard.todaysCosts, 
      value: `৳${stats?.todaysCosts.toFixed(0) || '0'}`, 
      icon: Wallet, 
      cardClass: 'stat-card-expense',
      iconClass: 'icon-container-danger',
      valueClass: 'text-destructive'
    },
    { 
      label: t.dashboard.customerDues, 
      value: `৳${stats?.totalCustomerDues.toFixed(0) || '0'}`, 
      icon: Users, 
      cardClass: 'stat-card-due',
      iconClass: 'icon-container-warning',
      valueClass: 'text-warning'
    },
    { 
      label: t.dashboard.supplierDues, 
      value: `৳${stats?.totalSupplierDues.toFixed(0) || '0'}`, 
      icon: Truck, 
      cardClass: 'stat-card-info',
      iconClass: 'icon-container-info',
      valueClass: 'text-info'
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

  // Localize transaction descriptions
  const getLocalizedDescription = (transaction: Transaction): string => {
    switch (transaction.type) {
      case 'sale':
        return `${t.dashboard.salePrefix} ${transaction.description.replace('বিক্রি ', '').replace('Sale ', '')}`;
      case 'due_collection':
        const customerName = transaction.description.replace('বকেয়া আদায় - ', '').replace('Due Collection - ', '');
        return `${t.dashboard.dueCollection} - ${customerName}`;
      case 'daily_cost':
        const costDesc = transaction.description.replace('খরচ - ', '').replace('Cost - ', '');
        return `${t.dashboard.costPrefix} - ${costDesc}`;
      case 'supplier_payment':
        const supplierName = transaction.description.replace('সাপ্লায়ার পেমেন্ট - ', '').replace('Supplier Payment - ', '');
        return `${t.dashboard.supplierPayment} - ${supplierName}`;
      default:
        return transaction.description;
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
    <div className="space-y-3 sm:space-y-6">
      {/* Header - Compact on mobile */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">{t.dashboard.title}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
          {t.dashboard.welcome}
        </p>
      </div>

      {/* Quick Stats - Ultra compact on mobile */}
      {isLoading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
          {quickStats.map((stat) => (
            <Card key={stat.label} className={cn("transition-all duration-300 hover:shadow-lg", stat.cardClass)}>
              <CardHeader className="flex flex-row items-center gap-2 sm:gap-3 pb-1 sm:pb-2 p-2 sm:p-3 md:p-4">
                <div className={cn("shrink-0 p-1.5 sm:p-2 rounded-lg", stat.iconClass)}>
                  <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <CardDescription className="text-[10px] sm:text-xs md:text-sm font-medium leading-tight">{stat.label}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-3 md:p-4 pt-0">
                <div className={cn("text-base sm:text-xl md:text-2xl font-bold", stat.valueClass)}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Expiry Overview - Compact */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 bg-gradient-to-r from-warning/10 to-warning/5 p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2">
              <div className="icon-container-warning p-1.5 sm:p-2">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              {t.dashboard.expiryAlerts}
            </CardTitle>
            <Link to="/dashboard/expiry">
              <Button variant="ghost" size="sm" className="gap-0.5 sm:gap-1 text-xs h-7 sm:h-8 px-2 sm:px-3">
                {t.dashboard.viewAll}
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-4 p-2 sm:p-4">
          {isLoading ? (
            <ExpiryStatsSkeleton />
          ) : (
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
              {expiryStats.map((stat) => (
                <div key={stat.label} className={cn(stat.badgeClass, "p-1.5 sm:p-2 md:p-3")}>
                  <div className="text-sm sm:text-lg md:text-2xl font-bold">{stat.value}</div>
                  <div className="text-[9px] sm:text-xs font-medium leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Trend Chart & Due Alerts Row */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Sales Trend Chart - Hero Style */}
        <Card className="overflow-hidden border-0 shadow-lg">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-br from-success via-success/90 to-success/80 p-3 sm:p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <span className="font-semibold text-sm sm:text-base">{t.dashboard.salesTrend}</span>
            </div>
            <p className="text-white/80 text-xs sm:text-sm">{t.dashboard.last7Days}</p>
          </div>
          
          <CardContent className="p-0">
            {trendLoading ? (
              <div className="p-4">
                <ChartSkeleton height="180px" />
              </div>
            ) : (
              <>
                {/* Chart Area */}
                <div className="h-[120px] sm:h-[160px] md:h-[180px] px-2 pt-2">
                  <ChartContainer config={chartConfig}>
                    <AreaChart 
                      data={salesTrend?.dailyData || []}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                          <stop offset="50%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="dayShort" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        dy={5}
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
                        strokeWidth={2.5}
                        fill="url(#salesGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: 'hsl(var(--success))', stroke: 'white', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
                
                {/* Bottom Stats Bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-muted/30 border-t">
                  {/* This Week */}
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{t.dashboard.thisWeek}</p>
                    <p className="text-base sm:text-xl font-bold text-foreground">
                      ৳{salesTrend?.thisWeekTotal?.toLocaleString() || 0}
                    </p>
                  </div>
                  
                  {/* Percentage Badge */}
                  <div className={cn(
                    "flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm",
                    salesTrend?.isPositive 
                      ? "bg-success text-white" 
                      : "bg-destructive text-white"
                  )}>
                    {salesTrend?.isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    {salesTrend?.percentChange || 0}%
                  </div>
                  
                  {/* Last Week */}
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{t.dashboard.lastWeek}</p>
                    <p className="text-base sm:text-xl font-bold text-muted-foreground">
                      ৳{salesTrend?.lastWeekTotal?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Due Alerts - Compact */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-1 sm:pb-2 bg-gradient-to-r from-warning/10 to-warning/5 p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2">
                <div className="icon-container-warning p-1.5 sm:p-2">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                {t.dashboard.dueAlerts}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4 p-2 sm:p-4">
            {dueLoading ? (
              <DueAlertsSkeleton />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {/* Customer Dues */}
                <div className="space-y-1.5 sm:space-y-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-warning">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{t.dashboard.customerDuesTitle}</span>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {dueAlerts?.topCustomers.length === 0 ? (
                      <p className="text-[10px] sm:text-xs text-muted-foreground py-2 sm:py-4 text-center">
                        {t.dashboard.noDues}
                      </p>
                    ) : (
                      dueAlerts?.topCustomers.slice(0, 2).map((customer) => (
                        <div 
                          key={customer.id} 
                          className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-[10px] sm:text-sm truncate max-w-[55%]">{customer.name}</span>
                          <span className="text-[10px] sm:text-sm font-semibold text-warning">
                            ৳{customer.totalDue > 0 ? customer.totalDue.toLocaleString() : '0'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <Link to="/dashboard/customer-dues">
                    <Button variant="ghost" size="sm" className="w-full gap-0.5 text-[10px] sm:text-xs h-6 sm:h-8 px-1 sm:px-2">
                      <span className="truncate">{t.dashboard.total}: ৳{(dueAlerts?.totalCustomerDue ?? 0) > 0 ? dueAlerts?.totalCustomerDue?.toLocaleString() : '0'}</span>
                      <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                    </Button>
                  </Link>
                </div>

                {/* Supplier Dues */}
                <div className="space-y-1.5 sm:space-y-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-info">
                    <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{t.dashboard.supplierDuesTitle}</span>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    {dueAlerts?.topSuppliers.length === 0 ? (
                      <p className="text-[10px] sm:text-xs text-muted-foreground py-2 sm:py-4 text-center">
                        {t.dashboard.noDues}
                      </p>
                    ) : (
                      dueAlerts?.topSuppliers.slice(0, 2).map((supplier) => (
                        <div 
                          key={supplier.id} 
                          className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-[10px] sm:text-sm truncate max-w-[55%]">{supplier.name}</span>
                          <span className="text-[10px] sm:text-sm font-semibold text-info">
                            ৳{supplier.totalDue > 0 ? supplier.totalDue.toLocaleString() : '0'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <Link to="/dashboard/suppliers">
                    <Button variant="ghost" size="sm" className="w-full gap-0.5 text-[10px] sm:text-xs h-6 sm:h-8 px-1 sm:px-2">
                      <span className="truncate">{t.dashboard.total}: ৳{(dueAlerts?.totalSupplierDue ?? 0) > 0 ? dueAlerts?.totalSupplierDue?.toLocaleString() : '0'}</span>
                      <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions - Compact */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-1 sm:pb-2 bg-gradient-to-r from-info/10 to-info/5 p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2">
              <div className="icon-container-info p-1.5 sm:p-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              {t.dashboard.recentTransactions}
            </CardTitle>
            <Link to="/dashboard/daily-cash">
              <Button variant="ghost" size="sm" className="gap-0.5 sm:gap-1 text-xs h-7 sm:h-8 px-2 sm:px-3">
                {t.dashboard.viewAll}
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
          <CardDescription className="text-xs sm:text-sm">{t.dashboard.todaysActivity}</CardDescription>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-4 p-2 sm:p-4">
          {transactionsLoading ? (
            <TransactionsListSkeleton count={4} />
          ) : transactions?.length === 0 ? (
            <div className="text-center py-4 sm:py-8 text-muted-foreground">
              <Receipt className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-1 sm:mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">{t.dashboard.noTransactions}</p>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {transactions?.slice(0, 4).map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const style = getTransactionStyle(transaction.type, transaction.isIncome);
                
                return (
                  <div 
                    key={transaction.id}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 p-1.5 sm:p-3 rounded-lg transition-colors",
                      style.bg
                    )}
                  >
                    <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", style.iconBg)}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{getLocalizedDescription(transaction)}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{transaction.time}</p>
                    </div>
                    <div className={cn("text-xs sm:text-sm font-bold shrink-0", style.text)}>
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
      {/* Trial Banner - Compact */}
      {subscription?.isTrial && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="py-3 sm:py-6 px-3 sm:px-6 relative">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-sm sm:text-lg truncate">{t.dashboard.trialTitle}</h3>
                <p className="text-muted-foreground text-[10px] sm:text-sm">
                  {trialDaysRemaining} {t.dashboard.trialDesc}
                </p>
              </div>
              <Link to="/billing" className="shrink-0">
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">
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
