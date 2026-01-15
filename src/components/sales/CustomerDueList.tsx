import { format } from 'date-fns';
import { Users, Phone, MapPin, CreditCard, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useCustomers, type Customer } from '@/hooks/useCustomers';
import { AddCustomerDialog } from './AddCustomerDialog';
import { RecordPaymentDialog } from './RecordPaymentDialog';

interface CustomerDueListProps {
  showAll?: boolean;
}

export function CustomerDueList({ showAll = false }: CustomerDueListProps) {
  const { customers, customersWithDue, deleteCustomer, isLoading } = useCustomers();

  const displayCustomers = showAll ? customers : customersWithDue;
  const totalDue = customersWithDue.reduce((sum, c) => sum + Number(c.total_due), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {showAll ? 'All Customers' : 'Customer Dues'}
            </CardTitle>
            <CardDescription>
              {showAll
                ? `${customers.length} customers total`
                : `${customersWithDue.length} customers with dues • Total: ৳${totalDue.toFixed(2)}`}
            </CardDescription>
          </div>
          <AddCustomerDialog />
        </div>
      </CardHeader>
      <CardContent>
        {displayCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">
              {showAll ? 'No customers yet' : 'No pending dues'}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {showAll
                ? 'Add customers to track their purchases and dues.'
                : 'All customers have cleared their dues.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Due Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        {customer.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.address}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(customer.total_due) > 0 ? (
                        <Badge variant="destructive" className="text-sm">
                          ৳{Number(customer.total_due).toFixed(2)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No Due</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {Number(customer.total_due) > 0 && (
                          <RecordPaymentDialog
                            customer={customer}
                            trigger={
                              <Button variant="ghost" size="sm" className="h-8">
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pay
                              </Button>
                            }
                          />
                        )}
                        <AddCustomerDialog
                          customer={customer}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{customer.name}"? This will remove all their records.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCustomer.mutate(customer.id)}
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
        )}
      </CardContent>
    </Card>
  );
}
