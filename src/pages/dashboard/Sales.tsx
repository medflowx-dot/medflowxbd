import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NewSaleDialog } from '@/components/sales/NewSaleDialog';
import { QuickSaleDialog } from '@/components/sales/QuickSaleDialog';
import { SalesTable } from '@/components/sales/SalesTable';
import { useSales, type EntryType } from '@/hooks/useSales';
import { Zap, ClipboardList, TrendingUp, Wallet, Loader2, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Sales() {
  const { sales, isLoading, todayStats } = useSales();
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | EntryType>('all');
  const { t } = useLanguage();

  const filteredSales = useMemo(() => {
    if (entryTypeFilter === 'all') return sales;
    return sales.filter((s) => s.entry_type === entryTypeFilter);
  }, [sales, entryTypeFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t.sales.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.sales.subtitle}
          </p>
        </div>
        <div className="flex gap-2">
          <QuickSaleDialog />
          <NewSaleDialog />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">{t.sales.quickSales}</span>
              <span className="sm:hidden">{t.sales.quick}</span>
            </CardDescription>
            <CardTitle className="text-lg sm:text-2xl">৳{todayStats.quickTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              {todayStats.quickCount} {t.sales.entries}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <ClipboardList className="h-3 w-3" />
              <span className="hidden sm:inline">{t.sales.detailedSales}</span>
              <span className="sm:hidden">{t.sales.detailed}</span>
            </CardDescription>
            <CardTitle className="text-lg sm:text-2xl">৳{todayStats.detailedTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              {todayStats.detailedCount} {t.sales.entries}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              {t.sales.totalToday}
            </CardDescription>
            <CardTitle className="text-lg sm:text-2xl text-primary">৳{todayStats.total.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              {todayStats.count} {t.sales.entries}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardDescription className="flex items-center gap-1 text-xs">
              <Wallet className="h-3 w-3" />
              {t.sales.cashCollected}
            </CardDescription>
            <CardTitle className="text-lg sm:text-2xl text-green-600">৳{todayStats.cash.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <p className="text-xs text-muted-foreground">
              {todayStats.due > 0 ? `৳${todayStats.due.toLocaleString()} ${t.sales.unpaid}` : t.sales.allPaid}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">{t.sales.salesEntries}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.sales.latestTransactions}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={entryTypeFilter} onValueChange={(v) => setEntryTypeFilter(v as 'all' | EntryType)}>
                <SelectTrigger className="w-[120px] sm:w-[150px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder={t.actions.filter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.sales.allTypes}</SelectItem>
                  <SelectItem value="quick">{t.sales.quick}</SelectItem>
                  <SelectItem value="detailed">{t.sales.detailed}</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="text-xs">
                {filteredSales.length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 md:p-6 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <SalesTable sales={filteredSales} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
