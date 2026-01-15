import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailyCashSummary } from '@/hooks/useDailyCash';
import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface CashFlowSummaryProps {
  date: Date;
}

export function CashFlowSummary({ date }: CashFlowSummaryProps) {
  const { data: summary, isLoading } = useDailyCashSummary(date);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Opening Cash */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Opening Cash</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ৳{summary?.openingCash?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Starting balance
          </p>
        </CardContent>
      </Card>

      {/* Cash In */}
      <Card className="border-green-200 dark:border-green-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-600">Cash In</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            +৳{summary?.totalIn?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
            <p>Sales: ৳{summary?.salesCashIn?.toLocaleString() || 0}</p>
            <p>Due Collected: ৳{summary?.dueCollected?.toLocaleString() || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cash Out */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600">Cash Out</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            -৳{summary?.totalOut?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
            <p>Supplier Payments: ৳{summary?.supplierPayments?.toLocaleString() || 0}</p>
            <p>Daily Costs: ৳{summary?.dailyCosts?.toLocaleString() || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Closing Cash */}
      <Card className={summary && summary.closingCash >= 0 ? 'border-primary' : 'border-red-500'}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closing Cash</CardTitle>
          {summary && summary.closingCash >= summary.openingCash ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary && summary.closingCash >= 0 ? 'text-primary' : 'text-red-600'}`}>
            ৳{summary?.closingCash?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            End of day balance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
