import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useCustomerWithPayments } from '@/hooks/useCustomerDues';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wallet } from 'lucide-react';

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

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, string> = {
      cash: 'bg-green-100 text-green-800',
      bkash: 'bg-pink-100 text-pink-800',
      nagad: 'bg-orange-100 text-orange-800',
      bank: 'bg-blue-100 text-blue-800',
    };
    return variants[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payment History - {customerName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-xl font-bold">{customer?.payments.length || 0}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <p className="text-sm text-muted-foreground">Current Due</p>
                <p className="text-xl font-bold text-destructive">
                  ৳{Number(customer?.total_due || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payment List */}
            <ScrollArea className="h-[300px]">
              {customer?.payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
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
                        <TableCell className="text-right font-medium text-green-600">
                          ৳{Number(payment.amount).toFixed(2)}
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
  );
}
