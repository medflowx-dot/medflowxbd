import { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SupplierPayment, SupplierPaymentType, useSuppliers } from '@/hooks/useSuppliers';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wallet, ArrowUpCircle, MoreHorizontal, Trash2, Search, Filter, X } from 'lucide-react';
import { EditSupplierPaymentDialog } from './EditSupplierPaymentDialog';

interface SupplierPaymentHistoryProps {
  payments: SupplierPayment[];
}

type DateFilter = 'all' | 'today' | 'this_week' | 'this_month' | 'last_7_days' | 'last_30_days';

const getPaymentTypeBadge = (type: SupplierPaymentType, t: any) => {
  switch (type) {
    case 'due_payment':
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <Wallet className="h-3 w-3 mr-1" />
          {t.suppliers?.duePayment || 'Due Payment'}
        </Badge>
      );
    case 'advance':
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <ArrowUpCircle className="h-3 w-3 mr-1" />
          {t.suppliers?.advancePayment || 'Advance'}
        </Badge>
      );
    case 'others':
      return (
        <Badge variant="secondary">
          <MoreHorizontal className="h-3 w-3 mr-1" />
          {t.suppliers?.othersPayment || 'Others'}
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <Wallet className="h-3 w-3 mr-1" />
          {t.suppliers?.duePayment || 'Due Payment'}
        </Badge>
      );
  }
};

export function SupplierPaymentHistory({ payments }: SupplierPaymentHistoryProps) {
  const { t } = useLanguage();
  const { deletePayment, suppliers } = useSuppliers();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<SupplierPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  // Get unique suppliers from payments
  const uniqueSuppliers = useMemo(() => {
    const suppliersMap = new Map<string, string>();
    payments.forEach(p => {
      if (p.supplier?.id && p.supplier?.name) {
        suppliersMap.set(p.supplier.id, p.supplier.name);
      }
    });
    return Array.from(suppliersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    const now = new Date();
    
    return payments.filter(payment => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSupplier = payment.supplier?.name?.toLowerCase().includes(query);
        const matchesRef = payment.reference_number?.toLowerCase().includes(query);
        const matchesNotes = payment.notes?.toLowerCase().includes(query);
        if (!matchesSupplier && !matchesRef && !matchesNotes) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const paymentDate = new Date(payment.payment_date);
        let start: Date;
        let end: Date = endOfDay(now);

        switch (dateFilter) {
          case 'today':
            start = startOfDay(now);
            break;
          case 'this_week':
            start = startOfWeek(now, { weekStartsOn: 0 });
            break;
          case 'this_month':
            start = startOfMonth(now);
            break;
          case 'last_7_days':
            start = startOfDay(subDays(now, 7));
            break;
          case 'last_30_days':
            start = startOfDay(subDays(now, 30));
            break;
          default:
            start = new Date(0);
        }

        if (!isWithinInterval(paymentDate, { start, end })) return false;
      }

      // Payment type filter
      if (paymentTypeFilter !== 'all') {
        if (payment.payment_type !== paymentTypeFilter) return false;
      }

      // Supplier filter
      if (supplierFilter !== 'all') {
        if (payment.supplier_id !== supplierFilter) return false;
      }

      return true;
    });
  }, [payments, searchQuery, dateFilter, paymentTypeFilter, supplierFilter]);

  const hasActiveFilters = searchQuery || dateFilter !== 'all' || paymentTypeFilter !== 'all' || supplierFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setPaymentTypeFilter('all');
    setSupplierFilter('all');
  };

  const handleDeleteClick = (payment: SupplierPayment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    
    setIsDeleting(true);
    try {
      await deletePayment(paymentToDelete.id);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate totals
  const totalFiltered = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.suppliers?.paymentHistory || 'Payment History'}</CardTitle>
          <CardDescription>{t.suppliers?.paymentsToSuppliers || 'Payments made to suppliers'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t.suppliers?.noPaymentsYet || 'No payments recorded yet.'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>{t.suppliers?.paymentHistory || 'Payment History'}</CardTitle>
              <CardDescription>
                {hasActiveFilters 
                  ? `${filteredPayments.length} ${t.suppliers?.paymentsFound || 'payments found'}`
                  : t.suppliers?.allPaymentsToSuppliers || 'All payments to suppliers'
                }
              </CardDescription>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {t.labels?.total || 'Total'}: ৳{totalFiltered.toFixed(2)}
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
                  <X className="h-4 w-4 mr-1" />
                  {t.suppliers?.clearFilters || 'Clear'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.suppliers?.searchPayments || 'Search payments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger>
                <SelectValue placeholder={t.suppliers?.filterByDate || 'Filter by date'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.suppliers?.allTime || 'All Time'}</SelectItem>
                <SelectItem value="today">{t.suppliers?.today || 'Today'}</SelectItem>
                <SelectItem value="this_week">{t.suppliers?.thisWeek || 'This Week'}</SelectItem>
                <SelectItem value="this_month">{t.suppliers?.thisMonth || 'This Month'}</SelectItem>
                <SelectItem value="last_7_days">{t.suppliers?.last7Days || 'Last 7 Days'}</SelectItem>
                <SelectItem value="last_30_days">{t.suppliers?.last30Days || 'Last 30 Days'}</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Type Filter */}
            <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.suppliers?.filterByType || 'Filter by type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.suppliers?.allTypes || 'All Types'}</SelectItem>
                <SelectItem value="due_payment">{t.suppliers?.duePayment || 'Due Payment'}</SelectItem>
                <SelectItem value="advance">{t.suppliers?.advancePayment || 'Advance'}</SelectItem>
                <SelectItem value="others">{t.suppliers?.othersPayment || 'Others'}</SelectItem>
              </SelectContent>
            </Select>

            {/* Supplier Filter */}
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.suppliers?.filterBySupplier || 'Filter by supplier'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.suppliers?.allSuppliers || 'All Suppliers'}</SelectItem>
                {uniqueSuppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.labels?.date || 'Date'}</TableHead>
                  <TableHead>{t.suppliers?.supplier || 'Supplier'}</TableHead>
                  <TableHead>{t.suppliers?.paymentType || 'Type'}</TableHead>
                  <TableHead>{t.sales?.paymentMethod || 'Method'}</TableHead>
                  <TableHead className="text-right">{t.labels?.amount || 'Amount'}</TableHead>
                  <TableHead className="text-right w-[100px]">{t.suppliers?.actions || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t.suppliers?.noPaymentsMatch || 'No payments match your filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{payment.supplier?.name}</div>
                        {payment.reference_number && (
                          <div className="text-xs text-muted-foreground">Ref: {payment.reference_number}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getPaymentTypeBadge(payment.payment_type || 'due_payment', t)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-success">
                        ৳{payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <EditSupplierPaymentDialog payment={payment} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(payment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {filteredPayments.length > 0 && (
            <div className="flex justify-end">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {filteredPayments.length} {t.suppliers?.paymentsLabel || 'payments'}
                  </span>
                  <span className="font-semibold text-success">
                    {t.labels?.total || 'Total'}: ৳{totalFiltered.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.suppliers?.deletePayment || 'Delete Payment'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.suppliers?.deletePaymentConfirm || 'Are you sure you want to delete this payment?'}
              {paymentToDelete && (
                <div className="mt-3 p-3 bg-muted rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{t.suppliers?.supplier || 'Supplier'}:</span>
                    <span className="font-medium">{paymentToDelete.supplier?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.labels?.amount || 'Amount'}:</span>
                    <span className="font-medium text-success">৳{paymentToDelete.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t.labels?.date || 'Date'}:</span>
                    <span className="font-medium">{format(new Date(paymentToDelete.payment_date), 'dd MMM yyyy')}</span>
                  </div>
                </div>
              )}
              <p className="mt-3 text-destructive text-sm">
                {t.suppliers?.deletePaymentWarning || 'This will update the supplier\'s due balance. This action cannot be undone.'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t.actions?.cancel || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (t.messages?.loading || 'Deleting...') : (t.actions?.delete || 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
