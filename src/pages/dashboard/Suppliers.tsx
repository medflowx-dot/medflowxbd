import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Truck, Users, CreditCard } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { AddSupplierDialog } from '@/components/suppliers/AddSupplierDialog';
import { AddPurchaseDialog } from '@/components/suppliers/AddPurchaseDialog';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { SupplierPaymentHistory } from '@/components/suppliers/SupplierPaymentHistory';
import { Skeleton } from '@/components/ui/skeleton';

export default function Suppliers() {
  const { suppliers, payments, isLoading } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');

  const totalSuppliers = suppliers.length;
  const totalPaid = suppliers.reduce((sum, s) => sum + s.total_paid, 0);
  const totalDue = suppliers.reduce((sum, s) => sum + s.total_due, 0);
  const suppliersWithDue = suppliers.filter((s) => s.total_due > 0).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20 mt-1" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Suppliers</h1>
          <p className="text-muted-foreground mt-1">
            Manage suppliers and track payments
          </p>
        </div>
        <div className="flex gap-2">
          <AddPurchaseDialog suppliers={suppliers} />
          <AddSupplierDialog />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Suppliers
            </CardDescription>
            <CardTitle className="text-2xl">{totalSuppliers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              With Due
            </CardDescription>
            <CardTitle className="text-2xl text-amber-600">{suppliersWithDue}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Total Paid
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">৳{totalPaid.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Due</CardDescription>
            <CardTitle className="text-2xl text-destructive">৳{totalDue.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="suppliers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Supplier List</CardTitle>
                  <CardDescription>All your medicine suppliers</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Truck className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No suppliers added</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mt-1">
                    Add your medicine suppliers to track orders and payments.
                  </p>
                  <div className="mt-4">
                    <AddSupplierDialog />
                  </div>
                </div>
              ) : (
                <SupplierTable suppliers={suppliers} searchQuery={searchQuery} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <SupplierPaymentHistory payments={payments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
