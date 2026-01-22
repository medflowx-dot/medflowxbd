import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Phone, Mail, Building2, Plus, FileText, History, ShoppingCart } from 'lucide-react';
import { Supplier, useSuppliers } from '@/hooks/useSuppliers';
import { useManufacturers } from '@/hooks/useManufacturers';
import { AddSupplierDialog } from './AddSupplierDialog';
import { SupplierPaymentDialog } from './SupplierPaymentDialog';
import { SupplierPaymentHistoryDialog } from './SupplierPaymentHistoryDialog';
import { SupplierPurchaseHistoryDialog } from './SupplierPurchaseHistoryDialog';
import { QuickReportDialog } from '@/components/reports/QuickReportDialog';
import { supabase } from '@/integrations/supabase/client';
import { generateIndividualSupplierPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface SupplierTableProps {
  suppliers: Supplier[];
  searchQuery: string;
}

export function SupplierTable({ suppliers, searchQuery }: SupplierTableProps) {
  const navigate = useNavigate();
  const { deleteSupplier, updateSupplier, payments, purchases } = useSuppliers();
  const { manufacturers } = useManufacturers();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { t } = useLanguage();

  const handleQuickReportClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setReportDialogOpen(true);
  };

  const handleGenerateReport = async (dateRange: { start: Date; end: Date }) => {
    if (!selectedSupplier) return;

    const startDate = dateRange.start.toISOString().split('T')[0];
    const endDate = dateRange.end.toISOString().split('T')[0];

    const { data: purchases, error: purchasesError } = await supabase
      .from('supplier_purchases')
      .select('id, purchase_date, invoice_number, total_amount, paid_amount, due_amount, notes')
      .eq('supplier_id', selectedSupplier.id)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)
      .order('purchase_date', { ascending: false });

    if (purchasesError) throw purchasesError;

    const { data: payments, error: paymentsError } = await supabase
      .from('supplier_payments')
      .select('id, payment_date, amount, payment_method, reference_number, notes')
      .eq('supplier_id', selectedSupplier.id)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;

    const totalPurchases = purchases?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;
    const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const reportData = {
      supplier: {
        id: selectedSupplier.id,
        name: selectedSupplier.name,
        phone: selectedSupplier.phone,
        address: selectedSupplier.address,
        contact_person: selectedSupplier.contact_person,
        total_due: selectedSupplier.total_due,
        total_paid: selectedSupplier.total_paid,
      },
      purchases: purchases || [],
      payments: payments || [],
      summary: {
        totalPurchases,
        totalPayments,
        currentDue: selectedSupplier.total_due,
        purchaseCount: purchases?.length || 0,
        paymentCount: payments?.length || 0,
      },
    };

    generateIndividualSupplierPDF(reportData, dateRange);
    toast.success(t.suppliers.pdfDownloaded);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSupplier(deleteId);
      setDeleteId(null);
    }
  };

  const handleManufacturerChange = async (supplierId: string, manufacturerId: string) => {
    setUpdatingId(supplierId);
    try {
      await updateSupplier({ id: supplierId, manufacturer_id: manufacturerId === 'none' ? null : manufacturerId });
    } finally {
      setUpdatingId(null);
    }
  };

  if (filteredSuppliers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchQuery ? t.suppliers.noSuppliersMatch : t.suppliers.noSuppliersYet}
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t.suppliers.supplier}</TableHead>
              <TableHead className="hidden md:table-cell">{t.suppliers.manufacturer}</TableHead>
              <TableHead className="hidden sm:table-cell">{t.suppliers.contact}</TableHead>
              <TableHead className="text-right">{t.suppliers.totalPaid}</TableHead>
              <TableHead className="text-right">{t.suppliers.totalDue}</TableHead>
              <TableHead className="w-[100px] sticky right-0 bg-background">{t.suppliers.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/dashboard/suppliers/${supplier.id}`)}
                  >
                    <div className="font-medium">{supplier.name}</div>
                    {supplier.contact_person && (
                      <div className="text-sm text-muted-foreground">{supplier.contact_person}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-auto py-1 px-2 ${!supplier.manufacturer_id ? 'text-muted-foreground' : ''}`}
                        disabled={updatingId === supplier.id}
                      >
                        {updatingId === supplier.id ? (
                          <span className="text-xs">{t.suppliers.saving}</span>
                        ) : supplier.manufacturer?.name ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {supplier.manufacturer.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs">
                            <Plus className="h-3 w-3" />
                            {t.suppliers.setManufacturer}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="start">
                      <Select
                        value={supplier.manufacturer_id || 'none'}
                        onValueChange={(value) => handleManufacturerChange(supplier.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t.suppliers.selectManufacturer} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t.medicines.none}</SelectItem>
                          {manufacturers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="space-y-1">
                    {supplier.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        {supplier.phone}
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {supplier.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-success">৳{Math.round(supplier.total_paid)}</span>
                </TableCell>
                <TableCell className="text-right">
                  {supplier.total_due > 0 ? (
                    <Badge variant="destructive">৳{Math.round(supplier.total_due)}</Badge>
                  ) : (
                    <Badge variant="secondary">৳0</Badge>
                  )}
                </TableCell>
                <TableCell className="sticky right-0 bg-background">
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      title={t.suppliers.quickReport}
                      onClick={() => handleQuickReportClick(supplier)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <SupplierPaymentHistoryDialog
                      supplier={supplier}
                      payments={payments}
                      trigger={
                        <Button size="icon" variant="ghost" title={t.suppliers.paymentHistory}>
                          <History className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <SupplierPurchaseHistoryDialog
                      supplier={supplier}
                      purchases={purchases}
                      trigger={
                        <Button size="icon" variant="ghost" title={t.suppliers.purchaseHistory}>
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <AddSupplierDialog
                      supplier={supplier}
                      trigger={
                        <Button size="icon" variant="ghost" title={t.actions.edit}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      title={t.actions.delete}
                      onClick={() => setDeleteId(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.suppliers.deleteSupplier}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.suppliers.deleteSupplierDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.actions.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QuickReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        title={`${t.suppliers.supplierReport}: ${selectedSupplier?.name || ''}`}
        description={t.suppliers.selectDateRange}
        onGenerate={handleGenerateReport}
      />
    </>
  );
}