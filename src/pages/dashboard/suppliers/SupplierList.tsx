import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Truck, Users, CreditCard, Loader2 } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { AddSupplierDialog } from '@/components/suppliers/AddSupplierDialog';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function SupplierList() {
  const { suppliers, isLoading } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const totalSuppliers = suppliers.length;
  const totalPaid = suppliers.reduce((sum, s) => sum + s.total_paid, 0);
  const totalDue = suppliers.reduce((sum, s) => sum + s.total_due, 0);
  // Count suppliers with non-zero dues (positive due OR negative/advance)
  const suppliersWithDue = suppliers.filter((s) => s.total_due !== 0).length;

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
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
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
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.suppliers.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.suppliers.subtitle}
          </p>
        </div>
        <AddSupplierDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 stagger-children">
        <Card className="stat-card-info transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-info shrink-0">
              <Users className="h-4 w-4 text-white" />
            </div>
            <CardDescription className="text-xs sm:text-sm font-medium">
              {t.suppliers.totalSuppliers}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <CardTitle className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400">{totalSuppliers}</CardTitle>
          </CardContent>
        </Card>
        
        <Card className="stat-card-due transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-warning shrink-0">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <CardDescription className="text-xs sm:text-sm font-medium">
              {t.suppliers.withDue}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <CardTitle className="text-xl sm:text-2xl text-amber-600 dark:text-amber-400">{suppliersWithDue}</CardTitle>
          </CardContent>
        </Card>
        
        <Card className="stat-card-sales transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-success shrink-0">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <CardDescription className="text-xs sm:text-sm font-medium">
              {t.suppliers.totalPaid}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <CardTitle className="text-xl sm:text-2xl text-green-600 dark:text-green-400">৳{totalPaid.toFixed(0)}</CardTitle>
          </CardContent>
        </Card>
        
        <Card className="stat-card-expense transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-danger shrink-0">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <CardDescription className="text-xs sm:text-sm font-medium">
              {t.suppliers.totalDue}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <CardTitle className="text-xl sm:text-2xl text-red-600 dark:text-red-400">৳{totalDue.toFixed(0)}</CardTitle>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="icon-container-info p-1.5">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                {t.suppliers.allSuppliers}
              </CardTitle>
              <CardDescription>{t.suppliers.supplierDetails}</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.suppliers.searchSuppliers}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-primary/50" />
              </div>
              <h3 className="font-semibold text-lg">{t.suppliers.noSuppliersAdded}</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                {t.suppliers.addSuppliersDesc}
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
    </div>
  );
}
