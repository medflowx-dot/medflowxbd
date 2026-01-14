import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DailyCash() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Daily Cash</h1>
          <p className="text-muted-foreground mt-1">
            Track your daily cash flow (auto-calculated)
          </p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Adjustment
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Opening Cash</CardDescription>
            <CardTitle className="text-2xl">৳0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Cash In</CardDescription>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">৳0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Cash Out</CardDescription>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">৳0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription>Closing Cash</CardDescription>
            <CardTitle className="text-2xl text-primary">৳0.00</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Transactions</CardTitle>
          <CardDescription>All cash movements for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No transactions today</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Daily cash is auto-calculated from sales, dues, supplier payments, and costs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
