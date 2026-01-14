import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Truck } from 'lucide-react';

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Manage suppliers and track payments
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Suppliers</CardDescription>
            <CardTitle className="text-2xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid</CardDescription>
            <CardTitle className="text-2xl">৳0.00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Due</CardDescription>
            <CardTitle className="text-2xl">৳0.00</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier List</CardTitle>
          <CardDescription>All your medicine suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No suppliers added</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-1">
              Add your medicine suppliers to track orders and payments.
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add First Supplier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
