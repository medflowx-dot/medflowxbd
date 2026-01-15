import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Zap, ClipboardList, TrendingUp, CreditCard, Loader2 } from 'lucide-react';
import { useSales, type EntryType } from '@/hooks/useSales';
import { NewSaleDialog } from '@/components/sales/NewSaleDialog';
import { QuickSaleDialog } from '@/components/sales/QuickSaleDialog';
import { SalesTable } from '@/components/sales/SalesTable';
import { CustomerDueList } from '@/components/sales/CustomerDueList';

export default function Sales() {
  const [entryTypeFilter, setEntryTypeFilter] = useState<'all' | EntryType>('all');
  const { sales, isLoading, todayStats } = useSales();

  const filteredSales = useMemo(() => {
    if (entryTypeFilter === 'all') return sales;
    return sales.filter((sale) => sale.entry_type === entryTypeFilter);
  }, [sales, entryTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Sales</h1>
          <p className="text-muted-foreground mt-1">
            Record daily sales and manage customer dues
          </p>
        </div>
        <div className="flex gap-2">
          <QuickSaleDialog />
          <NewSaleDialog />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Quick Sales Today
            </CardDescription>
            <CardTitle className="text-2xl">৳{todayStats.quickTotal.toFixed(2)}</CardTitle>
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
            <CardTitle className="text-2xl">৳{todayStats.detailedTotal.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {todayStats.detailedCount} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Total Sales Today
            </CardDescription>
            <CardTitle className="text-2xl text-primary">৳{todayStats.total.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Cash: ৳{todayStats.cash.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Due Today
            </CardDescription>
            <CardTitle className="text-2xl text-orange-600">৳{todayStats.due.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              From {todayStats.count} sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">All Sales</TabsTrigger>
          <TabsTrigger value="dues">Customer Dues</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Select
                value={entryTypeFilter}
                onValueChange={(value) => setEntryTypeFilter(value as 'all' | EntryType)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="quick">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Quick
                    </div>
                  </SelectItem>
                  <SelectItem value="detailed">
                    <div className="flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" />
                      Detailed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Badge variant="secondary">
              {filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <SalesTable sales={filteredSales} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dues">
          <Card>
            <CardHeader>
              <CardTitle>Customer Dues</CardTitle>
              <CardDescription>Manage outstanding customer balances</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerDueList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
