import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplierPayment, SupplierPaymentType } from '@/hooks/useSuppliers';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wallet, ArrowUpCircle, MoreHorizontal } from 'lucide-react';

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
