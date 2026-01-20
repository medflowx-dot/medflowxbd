import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { History, Pencil, Trash2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Supplier, SupplierPayment, useSuppliers } from '@/hooks/useSuppliers';
import { EditSupplierPaymentDialog } from './EditSupplierPaymentDialog';
import { SupplierPaymentDialog } from './SupplierPaymentDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface SupplierPaymentHistoryDialogProps {
  supplier: Supplier;
  payments: SupplierPayment[];
  trigger?: React.ReactNode;
}

export function SupplierPaymentHistoryDialog({ supplier, payments, trigger }: SupplierPaymentHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const { deletePayment } = useSuppliers();
  const { t } = useLanguage();

  const supplierPayments = payments.filter(p => p.supplier_id === supplier.id);
  const totalPayments = supplierPayments.reduce((sum, p) => sum + p.amount, 0);

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'due_payment':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">{t.suppliers.duePayment}</Badge>;
      case 'advance':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">{t.suppliers.advancePayment}</Badge>;
      case 'others':
        return <Badge variant="secondary">{t.suppliers.othersPayment}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLabels: Record<string, string> = {
      cash: t.sales.cash,
      bkash: t.sales.bkash,
      nagad: t.sales.nagad,
      bank: t.suppliers.bankTransfer,
      cheque: t.suppliers.cheque,
    };
    return methodLabels[method] || method;
  };

  const handleDelete = async () => {
    if (deletePaymentId) {
      await deletePayment(deletePaymentId);
      setDeletePaymentId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button size="icon" variant="ghost" title={t.suppliers.paymentHistory}>
              <History className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t.suppliers.paymentHistory}: {supplier.name}
            </DialogTitle>
            <DialogDescription>
              {t.suppliers.allPaymentsToSuppliers}
            </DialogDescription>
          </DialogHeader>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{t.suppliers.totalPaid}</p>
              <p className="text-xl font-bold text-green-600">৳{totalPayments.toFixed(2)}</p>
            </div>
            <div className="bg-destructive/10 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                {t.suppliers.currentDue}
              </p>
              <p className={cn(
                "text-xl font-bold",
                supplier.total_due > 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                ৳{supplier.total_due > 0 ? supplier.total_due.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          {/* Add Payment Button */}
          <div className="flex justify-end mb-2">
            <SupplierPaymentDialog
              supplier={supplier}
              trigger={
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  {t.suppliers.recordPayment}
                </Button>
              }
            />
          </div>

          {/* Payment History Table */}
          <ScrollArea className="h-[400px] rounded-md border">
            {supplierPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">{t.suppliers.noPaymentsYet}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.labels.date}</TableHead>
                    <TableHead>{t.suppliers.paymentType}</TableHead>
                    <TableHead>{t.sales.method}</TableHead>
                    <TableHead className="text-right">{t.labels.amount}</TableHead>
                    <TableHead className="w-[100px]">{t.suppliers.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(parseISO(payment.payment_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>{getPaymentTypeBadge(payment.payment_type)}</TableCell>
                      <TableCell>{getPaymentMethodBadge(payment.payment_method)}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ৳{payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <EditSupplierPaymentDialog
                            payment={payment}
                            trigger={
                              <Button size="icon" variant="ghost" title={t.suppliers.editPayment}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            title={t.suppliers.deletePayment}
                            onClick={() => setDeletePaymentId(payment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>

          {supplierPayments.length > 0 && (
            <div className="text-sm text-muted-foreground text-right">
              {supplierPayments.length} {t.suppliers.paymentsLabel}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePaymentId} onOpenChange={() => setDeletePaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.suppliers.deletePayment}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.suppliers.deletePaymentConfirm}
              <br />
              <span className="text-destructive">{t.suppliers.deletePaymentWarning}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
