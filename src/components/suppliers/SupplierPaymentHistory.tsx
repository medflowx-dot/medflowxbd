import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplierPayment } from '@/hooks/useSuppliers';

interface SupplierPaymentHistoryProps {
  payments: SupplierPayment[];
}

export function SupplierPaymentHistory({ payments }: SupplierPaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Payments made to suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No payments recorded yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentPayments = payments.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Last 10 payments to suppliers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
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
                    <Badge variant="outline" className="capitalize">
                      {payment.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    ৳{payment.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
