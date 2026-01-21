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
import { useCustomerWithPayments, useDeleteCustomerPayment, useDeleteCustomerDue, useClearCustomerHistory, CustomerPayment, CustomerDue } from '@/hooks/useCustomerDues';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wallet, Pencil, Trash2, ArrowDownCircle, ArrowUpCircle, Scissors, FileText, Eraser } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EditPaymentDialog } from './EditPaymentDialog';
import { EditDueDialog } from './EditDueDialog';
import { SplitDueDialog } from './SplitDueDialog';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generateCustomerStatementPDF } from '@/lib/pdfGenerator';

interface CustomerPaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  customerName: string | null;
}

type TransactionType = 'due' | 'payment';

interface TransactionItem {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  notes: string | null;
  payment_method?: string;
  original: CustomerPayment | CustomerDue;
}

export function CustomerPaymentHistory({ 
  open, 
  onOpenChange, 
  customerId, 
  customerName 
}: CustomerPaymentHistoryProps) {
  const { data: customer, isLoading } = useCustomerWithPayments(customerId);
  const deletePayment = useDeleteCustomerPayment();
  const deleteDue = useDeleteCustomerDue();
  const clearHistory = useClearCustomerHistory();
  const { t } = useLanguage();
  
  const [editPaymentOpen, setEditPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<CustomerPayment | null>(null);
  const [editDueOpen, setEditDueOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<CustomerDue | null>(null);
  const [splitDueOpen, setSplitDueOpen] = useState(false);
  const [dueToSplit, setDueToSplit] = useState<CustomerDue | null>(null);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);

  // Combine and sort dues and payments by date
  const transactions: TransactionItem[] = [];
  
  if (customer) {
    // Add dues
    customer.dues?.forEach(due => {
      transactions.push({
        id: due.id,
        type: 'due',
        amount: due.amount,
        date: due.due_date,
        notes: due.notes,
        original: due,
      });
    });
    
    // Add payments
    customer.payments?.forEach(payment => {
      transactions.push({
        id: payment.id,
        type: 'payment',
        amount: payment.amount,
        date: payment.payment_date,
        notes: payment.notes,
        payment_method: payment.payment_method,
        original: payment,
      });
    });
  }
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const handleEditDue = (due: CustomerDue) => {
    setSelectedDue(due);
    setEditDueOpen(true);
  };

  const handleSplitDue = (due: CustomerDue) => {
    setDueToSplit(due);
    setSplitDueOpen(true);
  };

  const handleExportStatement = () => {
    if (!customer) return;
    
    generateCustomerStatementPDF({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        total_due: customer.total_due,
      },
      transactions: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        date: tx.date,
        notes: tx.notes,
        payment_method: tx.payment_method,
      })),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {t.customerDues?.transactionHistory || 'Transaction History'} - {customerName}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {customer && transactions.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportStatement}
                      className="gap-1.5"
                    >
                      <FileText className="h-4 w-4" />
                      {t.customerDues?.exportStatement || 'Statement'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setClearHistoryOpen(true)}
                      className="gap-1.5"
                    >
                      <Eraser className="h-4 w-4" />
                      {t.customerDues?.clearHistory || 'Clear All'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.customerDues?.loading || 'Loading...'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    {t.customerDues?.allTransactions || 'Total Transactions'}
                  </p>
                  <p className="text-lg font-bold">{transactions.length}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t.customerDues?.dueEntry || 'Dues'}
                  </p>
                  <p className="text-lg font-bold text-warning">{customer?.dues?.length || 0}</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t.customerDues?.currentDue || 'Current Due'}
                  </p>
                  <p className="text-lg font-bold text-destructive">
                    ৳{Number(customer?.total_due || 0) > 0 ? Math.round(Number(customer?.total_due)) : '0'}
                  </p>
                </div>
              </div>

              {/* Transaction List */}
              <ScrollArea className="h-[350px]">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t.reports?.noPaymentsInPeriod || 'No transaction history found.'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.reports?.date || 'Date'}</TableHead>
                        <TableHead>{t.reports?.type || 'Type'}</TableHead>
                        <TableHead className="text-right">{t.customerDues?.amount || 'Amount'}</TableHead>
                        <TableHead className="text-right w-24 sticky right-0 bg-background">{t.medicines?.actions || 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={`${tx.type}-${tx.id}`}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {tx.type === 'due' ? (
                                <ArrowDownCircle className="h-4 w-4 text-warning" />
                              ) : (
                                <ArrowUpCircle className="h-4 w-4 text-success" />
                              )}
                              <span>{format(new Date(tx.date), 'MMM dd, yyyy')}</span>
                            </div>
                            {tx.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 ml-6 max-w-[120px] truncate" title={tx.notes}>
                                {tx.notes}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {tx.type === 'due' ? (
                              <Badge className="bg-warning/20 text-warning border-0">
                                {t.customerDues?.dueEntry || 'Due'}
                              </Badge>
                            ) : (
                              <Badge className={getPaymentMethodBadge(tx.payment_method || 'cash')}>
                                {tx.payment_method || 'cash'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${tx.type === 'due' ? 'text-warning' : 'text-success'}`}>
                            {tx.type === 'due' ? '+' : '-'}৳{Math.round(Number(tx.amount))}
                          </TableCell>
                          <TableCell className="text-right sticky right-0 bg-background">
                            <TooltipProvider delayDuration={100}>
                              <div className="flex items-center justify-end gap-0.5">
                                {/* Split button - only for dues */}
                                {tx.type === 'due' && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-info/10 text-info"
                                        onClick={() => handleSplitDue(tx.original as CustomerDue)}
                                      >
                                        <Scissors className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>{t.customerDues?.splitDue || 'Split Due'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                
                                {/* Edit button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-primary/10"
                                      onClick={() => tx.type === 'due' 
                                        ? handleEditDue(tx.original as CustomerDue)
                                        : handleEditPayment(tx.original as CustomerPayment)
                                      }
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>{tx.type === 'due' ? (t.customerDues?.editDue || 'Edit') : (t.customerDues?.editPayment || 'Edit')}</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                {/* Delete button */}
                                <AlertDialog>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>{t.actions?.delete || 'Delete'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {tx.type === 'due' 
                                          ? (t.customerDues?.deleteDue || 'Delete Due Entry')
                                          : (t.customerDues?.deletePayment || 'Delete Payment')
                                        }
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {tx.type === 'due'
                                          ? (t.customerDues?.deleteDueConfirm || "Are you sure you want to delete this due entry? The customer's balance will be recalculated.")
                                          : (t.customerDues?.deletePaymentConfirm || "Are you sure you want to delete this payment? The customer's due will be recalculated.")
                                        }
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t.actions?.cancel || 'Cancel'}</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => tx.type === 'due' 
                                          ? deleteDue.mutate(tx.id)
                                          : deletePayment.mutate(tx.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {t.actions?.delete || 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TooltipProvider>
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
      
      <EditDueDialog
        open={editDueOpen}
        onOpenChange={setEditDueOpen}
        due={selectedDue}
      />

      {customerId && (
        <SplitDueDialog
          open={splitDueOpen}
          onOpenChange={setSplitDueOpen}
          due={dueToSplit}
          customerId={customerId}
        />
      )}

      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={clearHistoryOpen} onOpenChange={setClearHistoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.customerDues?.clearHistoryTitle || 'সব হিস্ট্রি মুছে ফেলবেন?'}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                {t.customerDues?.clearHistoryDescription || 'এই কাস্টমারের সকল বকেয়া ও পেমেন্ট হিস্ট্রি স্থায়ীভাবে মুছে যাবে। এই পদক্ষেপ পূর্বাবস্থায় ফেরানো যাবে না।'}
              </span>
              {customer && (
                <span className="block font-medium text-destructive">
                  {t.customerDues?.willDeleteCount || 'মুছে যাবে:'} {customer.dues?.length || 0}টি বকেয়া এন্ট্রি ও {customer.payments?.length || 0}টি পেমেন্ট
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions?.cancel || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (customerId) {
                  clearHistory.mutate(customerId);
                  setClearHistoryOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.customerDues?.clearAll || 'সব মুছে ফেলুন'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
