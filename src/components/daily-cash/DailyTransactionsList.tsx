import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDailySales, useDailyCustomerPayments, useDailySupplierPayments, useDailyCosts, useDeleteDailyCost } from '@/hooks/useDailyCash';
import { Loader2, Trash2, ShoppingCart, CreditCard, Truck, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DailyTransactionsListProps {
  date: Date;
}

export function DailyTransactionsList({ date }: DailyTransactionsListProps) {
  const { data: sales, isLoading: salesLoading } = useDailySales(date);
  const { data: customerPayments, isLoading: customerPaymentsLoading } = useDailyCustomerPayments(date);
  const { data: supplierPayments, isLoading: supplierPaymentsLoading } = useDailySupplierPayments(date);
  const { data: costs, isLoading: costsLoading } = useDailyCosts(date);
  const deleteCost = useDeleteDailyCost();

  const isLoading = salesLoading || customerPaymentsLoading || supplierPaymentsLoading || costsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      cash: 'default',
      bkash: 'secondary',
      nagad: 'secondary',
      bank: 'outline',
    };
    return variants[method] || 'outline';
  };

  return (
    <Tabs defaultValue="sales" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="sales" className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Sales</span>
          <Badge variant="secondary" className="ml-1">{sales?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="due-collected" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Due Collected</span>
          <Badge variant="secondary" className="ml-1">{customerPayments?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="supplier-payments" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span className="hidden sm:inline">Supplier</span>
          <Badge variant="secondary" className="ml-1">{supplierPayments?.length || 0}</Badge>
        </TabsTrigger>
        <TabsTrigger value="costs" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Costs</span>
          <Badge variant="secondary" className="ml-1">{costs?.length || 0}</Badge>
        </TabsTrigger>
      </TabsList>

      {/* Sales Tab */}
      <TabsContent value="sales">
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>All sales transactions for {format(date, 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!sales?.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No sales for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-sm">{sale.invoice_number}</TableCell>
                        <TableCell>{sale.customers?.name || 'Walk-in'}</TableCell>
                        <TableCell>৳{Number(sale.total_amount).toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">৳{Number(sale.paid_amount).toLocaleString()}</TableCell>
                        <TableCell className={Number(sale.due_amount) > 0 ? 'text-red-600' : ''}>
                          ৳{Number(sale.due_amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentMethodBadge(sale.payment_method)}>
                            {sale.payment_method}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Due Collected Tab */}
      <TabsContent value="due-collected">
        <Card>
          <CardHeader>
            <CardTitle>Due Collected</CardTitle>
            <CardDescription>Customer due payments for {format(date, 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!customerPayments?.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No due payments collected
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.customers?.name || '-'}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          +৳{Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentMethodBadge(payment.payment_method)}>
                            {payment.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Supplier Payments Tab */}
      <TabsContent value="supplier-payments">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Payments</CardTitle>
            <CardDescription>Payments made to suppliers on {format(date, 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!supplierPayments?.length ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No supplier payments
                      </TableCell>
                    </TableRow>
                  ) : (
                    supplierPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.suppliers?.name || '-'}</TableCell>
                        <TableCell className="text-red-600 font-medium">
                          -৳{Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentMethodBadge(payment.payment_method)}>
                            {payment.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{payment.reference_number || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Costs Tab */}
      <TabsContent value="costs">
        <Card>
          <CardHeader>
            <CardTitle>Daily Costs</CardTitle>
            <CardDescription>Expenses recorded for {format(date, 'MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!costs?.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No costs recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    costs.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>
                          <Badge variant="outline">{cost.category}</Badge>
                        </TableCell>
                        <TableCell>{cost.description}</TableCell>
                        <TableCell className="text-red-600 font-medium">
                          -৳{Number(cost.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPaymentMethodBadge(cost.payment_method)}>
                            {cost.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Cost</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this cost entry? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCost.mutate(cost.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
