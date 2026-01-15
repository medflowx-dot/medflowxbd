import { format } from 'date-fns';
import { Trash2, Eye, Receipt } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useSales, type Sale } from '@/hooks/useSales';

interface SalesTableProps {
  sales: Sale[];
}

export function SalesTable({ sales }: SalesTableProps) {
  const { deleteSale } = useSales();

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No sales yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          Create your first sale to start tracking transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Due</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono text-sm">
                {sale.invoice_number}
              </TableCell>
              <TableCell>
                {format(new Date(sale.sale_date), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                {sale.customer ? (
                  <div>
                    <p className="font-medium">{sale.customer.name}</p>
                    {sale.customer.phone && (
                      <p className="text-xs text-muted-foreground">{sale.customer.phone}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Walk-in</span>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                ৳{Number(sale.total_amount).toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                ৳{Number(sale.paid_amount).toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {Number(sale.due_amount) > 0 ? (
                  <Badge variant="destructive">৳{Number(sale.due_amount).toFixed(2)}</Badge>
                ) : (
                  <Badge variant="secondary">Paid</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {sale.payment_method}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sale</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete invoice "{sale.invoice_number}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSale.mutate(sale.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
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
    </div>
  );
}
