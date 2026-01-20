import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NewSaleDialog } from '@/components/sales/NewSaleDialog';
import { QuickSaleDialog } from '@/components/sales/QuickSaleDialog';
import { SalesTable } from '@/components/sales/SalesTable';
import { useSales, type EntryType } from '@/hooks/useSales';
import { Zap, ClipboardList, TrendingUp, Wallet, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function Sales() {
  const { sales, isLoading, todayStats } = useSales();
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | EntryType>('all');
  const { t } = useLanguage();

  const filteredSales = useMemo(() => {
    if (entryTypeFilter === 'all') return sales;
    return sales.filter((s) => s.entry_type === entryTypeFilter);
  }, [sales, entryTypeFilter]);

  const summaryCards = [
    {
      label: t.sales.quickSales,
      shortLabel: t.sales.quick,
      value: todayStats.quickTotal,
      count: todayStats.quickCount,
      icon: Zap,
      cardClass: 'stat-card-due',
      iconClass: 'icon-container-warning',
      valueClass: 'text-warning'
    },
    {
      label: t.sales.detailedSales,
      shortLabel: t.sales.detailed,
      value: todayStats.detailedTotal,
      count: todayStats.detailedCount,
      icon: ClipboardList,
      cardClass: 'stat-card-info',
      iconClass: 'icon-container-info',
      valueClass: 'text-info'
    },
    {
      label: t.sales.totalToday,
      shortLabel: t.sales.totalToday,
      value: todayStats.total,
      count: todayStats.count,
      icon: TrendingUp,
      cardClass: 'stat-card-sales',
      iconClass: 'icon-container-success',
      valueClass: 'text-success'
    },
    {
      label: t.sales.cashCollected,
      shortLabel: t.sales.cashCollected,
      value: todayStats.cash,
      subtext: todayStats.due > 0 ? `৳${todayStats.due.toLocaleString()} ${t.sales.unpaid}` : t.sales.allPaid,
      icon: Wallet,
      cardClass: 'stat-card-sales',
      iconClass: 'icon-container-success',
      valueClass: 'text-success'
    },
  ];

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
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 stagger-children">
        {summaryCards.map((card, index) => (
          <Card key={card.label} className={cn("transition-all duration-300 hover:shadow-lg", card.cardClass)}>
            <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
              <CardDescription className="flex items-center gap-2 text-xs">
                <div className={cn("p-1.5 rounded-lg", card.iconClass)}>
                  <card.icon className="h-3 w-3 text-white" />
                </div>
                <span className="hidden sm:inline">{card.label}</span>
                <span className="sm:hidden">{card.shortLabel}</span>
              </CardDescription>
              <CardTitle className={cn("text-lg sm:text-2xl", card.valueClass)}>
                ৳{card.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                {card.subtext || `${card.count} ${t.sales.entries}`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales List */}
      <Card className="overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-muted/50 to-transparent">
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
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
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
