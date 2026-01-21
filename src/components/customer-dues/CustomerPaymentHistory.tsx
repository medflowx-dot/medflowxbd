import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useCustomerWithPayments, useDeleteCustomerPayment, CustomerPayment } from '@/hooks/useCustomerDues';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wallet, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EditPaymentDialog } from './EditPaymentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CustomerPaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  customerName: string | null;
}

export function CustomerPaymentHistory({ 
  open, 
  onOpenChange, 
  customerId, 
  customerName 
}: CustomerPaymentHistoryProps) {
  const { data: customer, isLoading } = useCustomerWithPayments(customerId);
  const deletePayment = useDeleteCustomerPayment();
  const { t } = useLanguage();
  
  const [editPaymentOpen, setEditPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CustomerPayment | null>(null);

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, string> = {
      cash: 'bg-success/20 text-success',
      bkash: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      nagad: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      bank: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    return variants[method] || 'bg-muted text-muted-foreground';
  };

  const handleEditPayment = (payment: CustomerPayment) => {
    setSelectedPayment(payment);
    setEditPaymentOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t.customerDues?.viewHistory || 'Payment History'} - {customerName}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.customerDues?.loading || 'Loading...'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    Total Payments
                  </p>
                  <p className="text-xl font-bold">{customer?.payments.length || 0}</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-sm text-muted-foreground">
                    {t.customerDues?.currentDue || 'Current Due'}
                  </p>
                  <p className="text-xl font-bold text-destructive">
                    ৳{Number(customer?.total_due || 0) > 0 ? Math.round(Number(customer?.total_due)) : '0'}
                  </p>
                </div>
              </div>

              {/* Payment List */}
              <ScrollArea className="h-[300px]">
                {customer?.payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.reports?.noPaymentsInPeriod || 'No payment history found.'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.reports?.date || 'Date'}</TableHead>
                        <TableHead>{t.reports?.method || 'Method'}</TableHead>
                        <TableHead className="text-right">{t.customerDues?.amount || 'Amount'}</TableHead>
                        <TableHead className="text-right w-20">{t.medicines?.actions || 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer?.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPaymentMethodBadge(payment.payment_method)}>
                              {payment.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-success">
                            ৳{Math.round(Number(payment.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/10"
                                onClick={() => handleEditPayment(payment)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {t.customerDues?.deletePayment || 'Delete Payment'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t.customerDues?.deletePaymentConfirm || 
                                        "Are you sure you want to delete this payment? The customer's due will be recalculated."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t.actions?.cancel || 'Cancel'}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deletePayment.mutate(payment.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t.actions?.delete || 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditPaymentDialog
        open={editPaymentOpen}
        onOpenChange={setEditPaymentOpen}
        payment={selectedPayment}
      />
    </>
  );
}
