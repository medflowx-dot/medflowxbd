import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Wallet, Plus, Search, Phone, MessageCircle, Trash2, FileText, Loader2 } from 'lucide-react';
import { useCustomers, useCustomerDuesSummary, useDeleteCustomer, shareViaWhatsApp, Customer } from '@/hooks/useCustomerDues';
import { supabase } from '@/integrations/supabase/client';
import { generateIndividualCustomerPDF } from '@/lib/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth } from 'date-fns';
import { AddCustomerDialog } from '@/components/customer-dues/AddCustomerDialog';
import { AddDueDialog } from '@/components/customer-dues/AddDueDialog';
import { RecordPaymentDialog } from '@/components/customer-dues/RecordPaymentDialog';
import { CustomerPaymentHistory } from '@/components/customer-dues/CustomerPaymentHistory';
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
} from '@/components/ui/alert-dialog';

export default function CustomerDues() {
  const [searchTerm, setSearchTerm] = useState('');
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addDueOpen, setAddDueOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const { data: customers, isLoading } = useCustomers();
  const { data: summary } = useCustomerDuesSummary();
  const deleteCustomer = useDeleteCustomer();

  const handleQuickReport = async (customer: Customer) => {
    try {
      setExportingId(customer.id);
      
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      // Fetch payments for this customer within date range
      const { data: payments, error } = await supabase
        .from('customer_payments')
        .select('*')
        .eq('customer_id', customer.id)
        .gte('payment_date', start.toISOString())
        .lte('payment_date', end.toISOString())
        .order('payment_date', { ascending: false });

      if (error) throw error;

      const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      const reportData = {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          total_due: Number(customer.total_due),
        },
        payments: payments || [],
        summary: {
          totalPayments,
          paymentCount: payments?.length || 0,
        },
      };

      generateIndividualCustomerPDF(reportData, { start, end });
      toast({
        title: 'Report Generated',
        description: `PDF report for ${customer.name} has been downloaded.`,
      });
    } catch (error) {
      console.error('Quick report error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report.',
        variant: 'destructive',
      });
    } finally {
      setExportingId(null);
    }
  };

  const filteredCustomers = customers?.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handleAddDue = (customer: any) => {
    setSelectedCustomer(customer);
    setAddDueOpen(true);
  };

  const handleRecordPayment = (customer: any) => {
    setSelectedCustomer(customer);
    setRecordPaymentOpen(true);
  };

  const handleViewHistory = (customer: any) => {
    setSelectedCustomer(customer);
    setPaymentHistoryOpen(true);
  };

  const handleWhatsApp = (customer: any) => {
    shareViaWhatsApp(customer);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      deleteCustomer.mutate(customerToDelete);
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Customer Dues</h1>
          <p className="text-muted-foreground mt-1">
            Track customer outstanding balances and payments
          </p>
        </div>
        <Button onClick={() => setAddCustomerOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Due Amount</CardDescription>
            <Wallet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ৳{summary?.totalDue.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Customers with Dues</CardDescription>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.customersWithDue || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Customers</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Customers</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredCustomers?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No customers found' : 'No customers yet. Add your first customer!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Due Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers?.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        {customer.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(customer.total_due) > 0 ? (
                          <Badge variant="destructive">৳{Number(customer.total_due).toFixed(2)}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">Paid</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickReport(customer)}
                            disabled={exportingId === customer.id}
                            title="Quick Report (This Month)"
                          >
                            {exportingId === customer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddDue(customer)}
                            title="Add Due"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecordPayment(customer)}
                            disabled={Number(customer.total_due) <= 0}
                            title="Record Payment"
                          >
                            <Wallet className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistory(customer)}
                            title="View History"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          {Number(customer.total_due) > 0 && customer.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWhatsApp(customer)}
                              title="Send WhatsApp Reminder"
                              className="text-green-600 hover:text-green-700"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCustomerToDelete(customer.id);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete Customer"
                            className="text-destructive hover:text-destructive"
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
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddCustomerDialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen} />
      
      <AddDueDialog
        open={addDueOpen}
        onOpenChange={setAddDueOpen}
        customer={selectedCustomer}
      />
      
      <RecordPaymentDialog
        open={recordPaymentOpen}
        onOpenChange={setRecordPaymentOpen}
        customer={selectedCustomer}
      />
      
      <CustomerPaymentHistory
        open={paymentHistoryOpen}
        onOpenChange={setPaymentHistoryOpen}
        customerId={selectedCustomer?.id}
        customerName={selectedCustomer?.name}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
