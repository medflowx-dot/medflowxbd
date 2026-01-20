import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyCashSummary } from '@/hooks/useDailyCash';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, TrendingDown, Loader2, Pencil, Clock, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CashFlowSummaryProps {
  date: Date;
  onEditOpeningCash?: () => void;
}

export function CashFlowSummary({ date, onEditOpeningCash }: CashFlowSummaryProps) {
  const { data: summary, isLoading } = useDailyCashSummary(date);
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPositiveBalance = summary && summary.closingCash >= 0;
  const isGrowth = summary && summary.closingCash >= summary.openingCash;

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-6 stagger-children">
      {/* Opening Cash */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 group bg-gradient-to-br from-muted/30 to-muted/10"
        onClick={onEditOpeningCash}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1">
            {t.dailyCash.openingCash}
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-muted">
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold">
            ৳{summary?.openingCash?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {t.dailyCash.tapToEdit}
          </p>
        </CardContent>
      </Card>

      {/* Total Sales - মোট বিক্রি */}
      <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-info/10 to-info/5 border-info/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-info">
            {t.dailyCash.totalSales}
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-info">
            <ShoppingCart className="h-4 w-4 text-info-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold text-info">
            ৳{summary?.totalSales?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-1 hidden sm:block">
            <p>{t.dailyCash.cashSales}: ৳{summary?.salesCashIn?.toLocaleString() || 0}</p>
            <p>{t.dailyCash.dueSales}: ৳{summary?.dueSales?.toLocaleString() || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cash In */}
      <Card className="cash-in-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
            {t.dailyCash.cashIn}
          </CardTitle>
          <div className="icon-container-success p-1.5">
            <ArrowDownLeft className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
            +৳{summary?.totalIn?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-1 hidden sm:block">
            <p>{t.dailyCash.sales}: ৳{summary?.salesCashIn?.toLocaleString() || 0}</p>
            <p>{t.dailyCash.dueCollected}: ৳{summary?.dueCollected?.toLocaleString() || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Due Sales - বাকিতে বিক্রি */}
      <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-warning">
            {t.dailyCash.dueSales}
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-warning">
            <Clock className="h-4 w-4 text-warning-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold text-warning">
            ৳{summary?.dueSales?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {t.dailyCash.pendingCollection}
          </p>
        </CardContent>
      </Card>

      {/* Cash Out */}
      <Card className="cash-out-card hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
            {t.dailyCash.cashOut}
          </CardTitle>
          <div className="icon-container-danger p-1.5">
            <ArrowUpRight className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
            -৳{summary?.totalOut?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-1 hidden sm:block">
            <p>{t.dailyCash.supplier}: ৳{summary?.supplierPayments?.toLocaleString() || 0}</p>
            <p>{t.dailyCash.costs}: ৳{summary?.dailyCosts?.toLocaleString() || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Closing Cash */}
      <Card className={cn(
        "hover:shadow-lg transition-all duration-300",
        isPositiveBalance ? "cash-balance-positive" : "cash-balance-negative"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">{t.dailyCash.closingCash}</CardTitle>
          <div className={cn(
            "p-1.5 rounded-lg",
            isGrowth ? "icon-container-success" : "icon-container-danger"
          )}>
            {isGrowth ? (
              <TrendingUp className="h-4 w-4 text-white" />
            ) : (
              <TrendingDown className="h-4 w-4 text-white" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className={cn(
            "text-lg sm:text-2xl font-bold",
            isPositiveBalance ? "text-primary" : "text-red-600 dark:text-red-400"
          )}>
            ৳{summary?.closingCash?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {t.dailyCash.endOfDayBalance}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
