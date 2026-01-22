import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Building2, 
  ShoppingCart, 
  History, 
  Pencil, 
  Trash2, 
  Plus,
  FileText,
  MessageCircle,
  Wallet,
  Eraser
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useSuppliers } from '@/hooks/useSuppliers';
import { usePermissions } from '@/hooks/usePermissions';
import { AddSupplierDialog } from '@/components/suppliers/AddSupplierDialog';
import { SupplierPaymentDialog } from '@/components/suppliers/SupplierPaymentDialog';
import { AddPurchaseDialog } from '@/components/suppliers/AddPurchaseDialog';
import { EditPurchaseDialog } from '@/components/suppliers/EditPurchaseDialog';
import { EditSupplierPaymentDialog } from '@/components/suppliers/EditSupplierPaymentDialog';
import { QuickReportDialog } from '@/components/reports/QuickReportDialog';
import { supabase } from '@/integrations/supabase/client';
import { generateIndividualSupplierPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export default function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, payments, purchases, deletePayment, deletePurchase, clearHistory, isLoading } = useSuppliers();
  const { t } = useLanguage();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('manage_suppliers');
  
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [deletePurchaseId, setDeletePurchaseId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);

  const supplier = useMemo(() => suppliers.find(s => s.id === id), [suppliers, id]);
  const supplierPayments = useMemo(() => payments.filter(p => p.supplier_id === id), [payments, id]);
  const supplierPurchases = useMemo(() => purchases.filter(p => p.supplier_id === id), [purchases, id]);

  const totalPurchaseAmount = supplierPurchases.reduce((sum, p) => sum + p.total_amount, 0);
  const totalPaidAmount = supplierPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleDeletePayment = async () => {
    if (deletePaymentId) {
      await deletePayment(deletePaymentId);
      setDeletePaymentId(null);
    }
  };

  const handleDeletePurchase = async () => {
    if (deletePurchaseId) {
      await deletePurchase(deletePurchaseId);
      setDeletePurchaseId(null);
    }
  };

  const handleGenerateReport = async (dateRange: { start: Date; end: Date }) => {
    if (!supplier) return;

    const startDate = dateRange.start.toISOString().split('T')[0];
    const endDate = dateRange.end.toISOString().split('T')[0];

    const { data: purchasesData, error: purchasesError } = await supabase
      .from('supplier_purchases')
      .select('id, purchase_date, invoice_number, total_amount, paid_amount, due_amount, notes')
      .eq('supplier_id', supplier.id)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)
      .order('purchase_date', { ascending: false });

    if (purchasesError) throw purchasesError;

    const { data: paymentsData, error: paymentsError } = await supabase
      .from('supplier_payments')
      .select('id, payment_date, amount, payment_method, reference_number, notes')
      .eq('supplier_id', supplier.id)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;

    const totalPurchases = purchasesData?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;
    const totalPayments = paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const reportData = {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        address: supplier.address,
        contact_person: supplier.contact_person,
        total_due: supplier.total_due,
        total_paid: supplier.total_paid,
      },
      purchases: purchasesData || [],
      payments: paymentsData || [],
      summary: {
        totalPurchases,
        totalPayments,
        currentDue: supplier.total_due,
        purchaseCount: purchasesData?.length || 0,
        paymentCount: paymentsData?.length || 0,
      },
    };

    generateIndividualSupplierPDF(reportData, dateRange);
    toast.success(t.suppliers.pdfDownloaded);
  };

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'due_payment':
        return <Badge className="bg-success/20 text-success border-success/30">{t.suppliers.duePayment}</Badge>;
      case 'advance':
        return <Badge className="bg-primary/20 text-primary border-primary/30">{t.suppliers.advancePayment}</Badge>;
      case 'others':
        return <Badge variant="secondary">{t.suppliers.othersPayment}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodLabels: Record<string, string> = {
      cash: t.sales.cash,
      bkash: t.sales.bkash,
      nagad: t.sales.nagad,
      bank: t.suppliers.bankTransfer,
      cheque: t.suppliers.cheque,
    };
    return methodLabels[method] || method;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Truck className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold">{t.suppliers.noSuppliersMatch}</h2>
        <Button variant="outline" onClick={() => navigate('/dashboard/suppliers')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.suppliers.supplierList}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/suppliers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
              <Truck className="h-7 w-7 text-primary" />
              {supplier.name}
            </h1>
            {supplier.manufacturer?.name && (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <Building2 className="h-4 w-4" />
                {supplier.manufacturer.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setReportDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            {t.suppliers.quickReport}
          </Button>
          {canManage && (supplierPayments.length > 0 || supplierPurchases.length > 0) && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setClearHistoryOpen(true)}
            >
              <Eraser className="h-4 w-4 mr-2" />
              {t.suppliers.clearHistory || 'সব মুছুন'}
            </Button>
          )}
          {canManage && (
            <AddSupplierDialog
              supplier={supplier}
              trigger={
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  {t.actions.edit}
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Contact Info & Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Contact Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t.suppliers.contact}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {supplier.contact_person && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{supplier.contact_person}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${supplier.phone}`} className="hover:text-primary">{supplier.phone}</a>
              </div>
            )}
            {supplier.whatsapp_number && (
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <a href={`https://wa.me/${supplier.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  {supplier.whatsapp_number}
                </a>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${supplier.email}`} className="hover:text-primary">{supplier.email}</a>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{supplier.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card className="stat-card-info">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t.suppliers.totalPurchaseAmount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">৳{totalPurchaseAmount.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{supplierPurchases.length} {t.suppliers.purchasesLabel}</p>
          </CardContent>
        </Card>

        <Card className="stat-card-sales">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t.suppliers.totalPaid}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">৳{totalPaidAmount.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{supplierPayments.length} {t.suppliers.paymentsLabel}</p>
          </CardContent>
        </Card>

        <Card className="stat-card-expense">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t.suppliers.currentDue}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-2xl font-bold",
              supplier.total_due > 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              ৳{supplier.total_due > 0 ? supplier.total_due.toFixed(0) : '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {supplier.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.suppliers.additionalNotes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{supplier.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Payments & Purchases */}
      <Tabs defaultValue="purchases" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="purchases" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            {t.suppliers.purchaseHistory}
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <History className="h-4 w-4" />
            {t.suppliers.paymentHistory}
          </TabsTrigger>
        </TabsList>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t.suppliers.purchaseHistory}</CardTitle>
                <CardDescription>{t.suppliers.purchaseHistoryDesc}</CardDescription>
              </div>
              {canManage && (
                <AddPurchaseDialog
                  suppliers={suppliers}
                  defaultSupplierId={supplier.id}
                  trigger={
                    <Button size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      {t.suppliers.addPurchase}
                    </Button>
                  }
                />
              )}
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <ScrollArea className="h-[400px]">
                {supplierPurchases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">{t.suppliers.noPurchasesYet}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.labels.date}</TableHead>
                        <TableHead className="text-right">{t.labels.total}</TableHead>
                        <TableHead className="text-right">{t.sales.paid}</TableHead>
                        <TableHead className="text-right">{t.suppliers.dueAmount}</TableHead>
                        <TableHead className="w-[80px] sticky right-0 bg-background">{t.suppliers.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="whitespace-nowrap">{format(parseISO(purchase.purchase_date), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="text-right font-medium">৳{Math.round(purchase.total_amount)}</TableCell>
                          <TableCell className="text-right text-success">৳{Math.round(purchase.paid_amount)}</TableCell>
                          <TableCell className="text-right">
                            {purchase.due_amount > 0 ? (
                              <Badge variant="destructive">৳{Math.round(purchase.due_amount)}</Badge>
                            ) : (
                              <Badge variant="secondary">৳0</Badge>
                            )}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-background">
                            {canManage && (
                              <div className="flex items-center gap-1">
                                <EditPurchaseDialog
                                  purchase={purchase}
                                  trigger={
                                    <Button size="icon" variant="ghost">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  }
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setDeletePurchaseId(purchase.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t.suppliers.paymentHistory}</CardTitle>
                <CardDescription>{t.suppliers.allPaymentsToSuppliers}</CardDescription>
              </div>
              {canManage && (
                <SupplierPaymentDialog
                  supplier={supplier}
                  trigger={
                    <Button size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      {t.suppliers.recordPayment}
                    </Button>
                  }
                />
              )}
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <ScrollArea className="h-[400px]">
                {supplierPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">{t.suppliers.noPaymentsYet}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.labels.date}</TableHead>
                        <TableHead>{t.suppliers.paymentType}</TableHead>
                        <TableHead>{t.sales.method}</TableHead>
                        <TableHead className="text-right">{t.labels.amount}</TableHead>
                        <TableHead className="w-[80px] sticky right-0 bg-background">{t.suppliers.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="whitespace-nowrap">{format(parseISO(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                          <TableCell>{getPaymentTypeBadge(payment.payment_type)}</TableCell>
                          <TableCell>{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                          <TableCell className="text-right font-medium text-success">৳{Math.round(payment.amount)}</TableCell>
                          <TableCell className="sticky right-0 bg-background">
                            {canManage && (
                              <div className="flex items-center gap-1">
                                <EditSupplierPaymentDialog
                                  payment={payment}
                                  trigger={
                                    <Button size="icon" variant="ghost">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  }
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setDeletePaymentId(payment.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Payment Confirmation */}
      <AlertDialog open={!!deletePaymentId} onOpenChange={() => setDeletePaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.suppliers.deletePayment}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.suppliers.deletePaymentConfirm}
              <br />
              <span className="text-destructive">{t.suppliers.deletePaymentWarning}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePayment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Purchase Confirmation */}
      <AlertDialog open={!!deletePurchaseId} onOpenChange={() => setDeletePurchaseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.suppliers.deletePurchase}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.suppliers.deletePurchaseConfirm}
              <br />
              <span className="text-destructive">{t.suppliers.deletePurchaseWarning}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePurchase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Report Dialog */}
      <QuickReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        title={`${t.suppliers.supplierReport}: ${supplier.name}`}
        description={t.suppliers.selectDateRange}
        onGenerate={handleGenerateReport}
      />

      {/* Clear History Confirmation */}
      <AlertDialog open={clearHistoryOpen} onOpenChange={setClearHistoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.suppliers.clearHistoryTitle}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">{t.suppliers.clearHistoryDescription}</span>
              <span className="block font-medium text-destructive">
                {t.suppliers.willDeleteCount || 'মুছে যাবে:'} {supplierPurchases.length}টি পারচেজ ও {supplierPayments.length}টি পেমেন্ট
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (id) {
                  clearHistory(id);
                  setClearHistoryOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.suppliers.clearHistory}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
