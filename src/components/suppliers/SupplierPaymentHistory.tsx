import { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Wallet, ArrowUpCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { EditSupplierPaymentDialog } from './EditSupplierPaymentDialog';

interface SupplierPaymentHistoryProps {
  payments: SupplierPayment[];
}

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
  const { deletePayment } = useSuppliers();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<SupplierPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.suppliers?.recentPayments || 'Recent Payments'}</CardTitle>
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

  const recentPayments = payments.slice(0, 10);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t.suppliers?.recentPayments || 'Recent Payments'}</CardTitle>
          <CardDescription>{t.suppliers?.last10Payments || 'Last 10 payments to suppliers'}</CardDescription>
        </CardHeader>
        <CardContent>
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
                {recentPayments.map((payment) => (
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
                    <TableCell className="text-right font-medium text-green-600">
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
                ))}
              </TableBody>
            </Table>
          </div>
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
                    <span className="font-medium text-green-600">৳{paymentToDelete.amount.toFixed(2)}</span>
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
