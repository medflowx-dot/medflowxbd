import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Wallet, Plus, Search, Phone, MessageCircle, Trash2, FileText, Loader2, Pencil, Pill, Filter, FilterX } from 'lucide-react';
import { useCustomers, useCustomerDuesSummary, useDeleteCustomer, shareViaWhatsApp, Customer } from '@/hooks/useCustomerDues';
import { useCustomersWithPrescriptions } from '@/hooks/useCustomerPrescriptions';
import { supabase } from '@/integrations/supabase/client';
import { generateIndividualCustomerPDF } from '@/lib/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AddCustomerDialog } from '@/components/customer-dues/AddCustomerDialog';
import { AddDueDialog } from '@/components/customer-dues/AddDueDialog';
import { RecordPaymentDialog } from '@/components/customer-dues/RecordPaymentDialog';
import { CustomerPaymentHistory } from '@/components/customer-dues/CustomerPaymentHistory';
import { EditCustomerDialog } from '@/components/customer-dues/EditCustomerDialog';
import { QuickReportDialog } from '@/components/reports/QuickReportDialog';
import { cn } from '@/lib/utils';
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
  const [showOnlyWithPrescriptions, setShowOnlyWithPrescriptions] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addDueOpen, setAddDueOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportCustomer, setReportCustomer] = useState<Customer | null>(null);
  const [historyInitialTab, setHistoryInitialTab] = useState<'transactions' | 'prescriptions'>('transactions');

  const { data: customers, isLoading } = useCustomers();
  const { data: summary } = useCustomerDuesSummary();
  const { data: customersWithPrescriptions } = useCustomersWithPrescriptions();
  const deleteCustomer = useDeleteCustomer();
  const { t } = useLanguage();

  const handleQuickReportClick = (customer: Customer) => {
    setReportCustomer(customer);
    setReportDialogOpen(true);
  };

  const handleGenerateReport = async (dateRange: { start: Date; end: Date }) => {
    if (!reportCustomer) return;

    // Fetch payments for this customer within date range
    const { data: payments, error } = await supabase
      .from('customer_payments')
      .select('*')
      .eq('customer_id', reportCustomer.id)
      .gte('payment_date', dateRange.start.toISOString())
      .lte('payment_date', dateRange.end.toISOString())
      .order('payment_date', { ascending: false });

    if (error) throw error;

    const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const reportData = {
      customer: {
        id: reportCustomer.id,
        name: reportCustomer.name,
        phone: reportCustomer.phone,
        address: reportCustomer.address,
        total_due: Number(reportCustomer.total_due),
      },
      payments: payments || [],
      summary: {
        totalPayments,
        paymentCount: payments?.length || 0,
      },
    };

    generateIndividualCustomerPDF(reportData, dateRange);
    toast({
      title: t.customerDues.reportGenerated,
      description: t.customerDues.pdfDownloaded.replace('{name}', reportCustomer.name),
    });
  };

  const filteredCustomers = customers?.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm);
    const matchesPrescriptionFilter = !showOnlyWithPrescriptions || 
      customersWithPrescriptions?.includes(c.id);
    return matchesSearch && matchesPrescriptionFilter;
  });

  const handleAddDue = (customer: any) => {
    setSelectedCustomer(customer);
    setAddDueOpen(true);
  };

  const handleRecordPayment = (customer: any) => {
    setSelectedCustomer(customer);
    setRecordPaymentOpen(true);
  };

  const handleViewHistory = (customer: any, tab: 'transactions' | 'prescriptions' = 'transactions') => {
    setSelectedCustomer(customer);
    setHistoryInitialTab(tab);
    setPaymentHistoryOpen(true);
  };

  const handleViewPrescription = (customer: any) => {
    handleViewHistory(customer, 'prescriptions');
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
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t.customerDues.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.customerDues.subtitle}
          </p>
        </div>
        <Button onClick={() => setAddCustomerOpen(true)} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Plus className="h-4 w-4 mr-2" />
          {t.customerDues.addCustomer}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 stagger-children">
        <Card className="stat-card-expense transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-danger shrink-0">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <CardDescription className="text-xs sm:text-sm font-medium">{t.customerDues.totalDueAmount}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-destructive">
              ৳{(summary?.totalDue ?? 0) > 0 ? summary?.totalDue.toFixed(0) : '0'}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-due transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-warning shrink-0">
              <Users className="h-4 w-4 text-white" />
            </div>
            <CardDescription className="text-xs sm:text-sm font-medium">{t.customerDues.customersWithDues}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-warning">{summary?.customersWithDue || 0}</div>
          </CardContent>
        </Card>

        <Card className="stat-card-info transition-all duration-300 hover:shadow-lg col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-3 pb-2 p-3 sm:p-4">
            <div className="icon-container-info shrink-0">
              <Users className="h-4 w-4 text-white" />
            </div>
            <CardDescription className="text-xs sm:text-sm font-medium">{t.customerDues.totalCustomers}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-info">{customers?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <div className="icon-container-warning p-1.5">
                <Users className="h-4 w-4 text-white" />
              </div>
              {t.customerDues.allCustomers}
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={showOnlyWithPrescriptions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyWithPrescriptions(!showOnlyWithPrescriptions)}
                className={cn(
                  "gap-1.5 shrink-0",
                  showOnlyWithPrescriptions && "bg-primary text-primary-foreground"
                )}
              >
                {showOnlyWithPrescriptions ? <FilterX className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                <Pill className="h-4 w-4" />
                <span className="hidden sm:inline">{t.customerDues?.prescriptionFilter || 'Prescription'}</span>
              </Button>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.customerDues.searchByNamePhone}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCustomers?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="h-16 w-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                <Users className="h-8 w-8 opacity-30" />
              </div>
              <p>{searchTerm ? t.customerDues.noCustomersFound : t.customerDues.noCustomersYet}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>{t.customerDues.name}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t.customerDues.phone}</TableHead>
                    <TableHead className="text-right">{t.customerDues.dueAmount}</TableHead>
                    <TableHead className="text-right w-auto sticky right-0 bg-muted/30 backdrop-blur-sm">{t.medicines.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers?.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {customer.name}
                        {customer.phone && (
                          <span className="block sm:hidden text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {customer.phone ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(customer.total_due) > 0 ? (
                          <Badge className="bg-destructive text-destructive-foreground border-0 shadow-sm">
                            ৳{Number(customer.total_due).toFixed(0)}
                          </Badge>
                        ) : (
                          <Badge className="bg-success text-success-foreground border-0 shadow-sm">
                            {t.customerDues.paid}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right sticky right-0 bg-background">
                        <div className="flex justify-end gap-0.5 sm:gap-1 flex-nowrap">
                          <EditCustomerDialog
                            customer={customer}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                title={t.customerDues?.editCustomer || 'Edit Customer'}
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickReportClick(customer)}
                            title={t.customerDues.quickReport}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddDue(customer)}
                            title={t.customerDues.addDue}
                            className="h-8 w-8 p-0 hover:bg-warning/10 text-warning"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecordPayment(customer)}
                            disabled={Number(customer.total_due) <= 0}
                            title={t.customerDues.recordPayment}
                            className="h-8 w-8 p-0 hover:bg-success/10 text-success"
                          >
                            <Wallet className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPrescription(customer)}
                            title={t.customerDues?.viewPrescription || 'View Prescription'}
                            className={`h-8 w-8 p-0 hover:bg-primary/10 ${customersWithPrescriptions?.includes(customer.id) ? 'text-primary' : 'text-muted-foreground'}`}
                          >
                            <Pill className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistory(customer)}
                            title={t.customerDues.viewHistory}
                            className="h-8 w-8 p-0 hover:bg-info/10 text-info"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          {Number(customer.total_due) > 0 && customer.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWhatsApp(customer)}
                              title={t.customerDues.sendWhatsApp}
                              className="h-8 w-8 p-0 hover:bg-success/10 text-success"
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
                            title={t.customerDues.deleteCustomer}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
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
        initialTab={historyInitialTab}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.customerDues.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.customerDues.deleteConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QuickReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        title={`${t.customerDues.customerReport}: ${reportCustomer?.name || ''}`}
        description={t.customerDues.selectDateRange}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
}
