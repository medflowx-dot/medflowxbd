import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';

export default function Sales() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Sales</h1>
          <p className="text-muted-foreground mt-1">
            Record daily sales and manage customer dues
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Cash Sales</CardDescription>
            <CardTitle className="text-2xl">৳0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Due Sales</CardDescription>
            <CardTitle className="text-2xl">৳0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Due Balance</CardDescription>
            <CardTitle className="text-2xl">৳0.00</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No sales recorded</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Start recording your daily sales to track revenue and customer dues.
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Record First Sale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
