import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { NewSaleDialog } from '@/components/sales/NewSaleDialog';
import { QuickSaleDialog } from '@/components/sales/QuickSaleDialog';
import { SalesTable } from '@/components/sales/SalesTable';
import { useSales, type EntryType } from '@/hooks/useSales';
import { Zap, ClipboardList, TrendingUp, Wallet, Loader2 } from 'lucide-react';

export default function Sales() {
  const { sales, isLoading, todayStats } = useSales();
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | EntryType>('all');

  const filteredSales = useMemo(() => {
    if (entryTypeFilter === 'all') return sales;
    return sales.filter((s) => s.entry_type === entryTypeFilter);
  }, [sales, entryTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Tracking</h1>
          <p className="text-muted-foreground">
            Internal revenue tracking and daily sales management
          </p>
        </div>
        <div className="flex gap-2">
          <QuickSaleDialog />
          <NewSaleDialog />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Quick Sales Today
            </CardDescription>
            <CardTitle className="text-2xl">৳{todayStats.quickTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {todayStats.quickCount} entries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <ClipboardList className="h-3 w-3" />
              Detailed Sales Today
            </CardDescription>
            <CardTitle className="text-2xl">৳{todayStats.detailedTotal.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {todayStats.detailedCount} entries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Total Sales Today
            </CardDescription>
            <CardTitle className="text-2xl text-primary">৳{todayStats.total.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {todayStats.count} total entries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Cash Collected
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">৳{todayStats.cash.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {todayStats.due > 0 ? `৳${todayStats.due.toLocaleString()} unpaid` : 'All paid'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales Entries</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={entryTypeFilter} onValueChange={(v) => setEntryTypeFilter(v as 'all' | EntryType)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quick">Quick Only</SelectItem>
                <SelectItem value="detailed">Detailed Only</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">
              {filteredSales.length} {filteredSales.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
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
