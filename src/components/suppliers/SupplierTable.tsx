import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Phone, Mail, Building2, Plus, FileText, History, ShoppingCart, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Supplier, useSuppliers } from '@/hooks/useSuppliers';
import { useManufacturers } from '@/hooks/useManufacturers';
import { useIsMobile } from '@/hooks/use-mobile';
import { AddSupplierDialog } from './AddSupplierDialog';
import { SupplierPaymentDialog } from './SupplierPaymentDialog';
import { SupplierPaymentHistoryDialog } from './SupplierPaymentHistoryDialog';
import { SupplierPurchaseHistoryDialog } from './SupplierPurchaseHistoryDialog';
import { QuickReportDialog } from '@/components/reports/QuickReportDialog';
import { supabase } from '@/integrations/supabase/client';
import { generateIndividualSupplierPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface SupplierTableProps {
  suppliers: Supplier[];
  searchQuery: string;
  canManage?: boolean;
}

export function SupplierTable({ suppliers, searchQuery, canManage = true }: SupplierTableProps) {
  const navigate = useNavigate();
  const { deleteSupplier, updateSupplier, payments, purchases } = useSuppliers();
  const { manufacturers } = useManufacturers();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [expandedSupplierId, setExpandedSupplierId] = useState<string | null>(null);
  const { t } = useLanguage();
  const isMobile = useIsMobile();

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
      <div className={cn("border rounded-lg", isMobile ? "overflow-hidden" : "overflow-x-auto")}>
        <Table className={cn(!isMobile && "min-w-[600px]")}>
          <TableHeader>
            <TableRow>
              <TableHead>{t.suppliers.supplier}</TableHead>
              <TableHead className="hidden md:table-cell">{t.suppliers.manufacturer}</TableHead>
              <TableHead className="hidden sm:table-cell">{t.suppliers.contact}</TableHead>
              <TableHead className="text-right">{t.suppliers.totalPaid}</TableHead>
              <TableHead className="text-right">{t.suppliers.totalDue}</TableHead>
              <TableHead className="w-[100px]">{t.suppliers.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => {
              const isExpanded = expandedSupplierId === supplier.id;

              // Action items for mobile grid
              type ActionItem = {
                icon: typeof FileText;
                label: string;
                color: string;
                onClick?: () => void;
                type?: 'edit' | 'paymentHistory' | 'purchaseHistory';
                disabled?: boolean;
              };

              const actionItems: ActionItem[] = [
                { 
                  icon: FileText, 
                  label: t.suppliers?.quickReport || 'Report', 
                  onClick: () => handleQuickReportClick(supplier), 
                  color: 'text-primary' 
                },
                { 
                  icon: History, 
                  label: t.suppliers?.paymentHistory || 'Payments', 
                  color: 'text-info',
                  type: 'paymentHistory'
                },
                { 
                  icon: ShoppingCart, 
                  label: t.suppliers?.purchaseHistory || 'Purchases', 
                  color: 'text-primary',
                  type: 'purchaseHistory'
                },
                { 
                  icon: Pencil, 
                  label: t.actions?.edit || 'Edit', 
                  color: 'text-primary',
                  type: 'edit',
                  disabled: !canManage
                },
                ...(canManage ? [{
                  icon: Trash2, 
                  label: t.actions?.delete || 'Delete', 
                  onClick: () => setDeleteId(supplier.id), 
                  color: 'text-destructive'
                }] : []),
              ];

              return (
                <>
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
                    <TableCell>
                      {/* Mobile: Show expand button */}
                      {isMobile ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSupplierId(isExpanded ? null : supplier.id)}
                          className="h-8 px-2 gap-1 hover:bg-primary/10"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      ) : (
                        /* Desktop: Show all action buttons inline */
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
                              <Button size="icon" variant="ghost" title={t.actions.edit} disabled={!canManage}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            }
                          />
                          {canManage && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title={t.actions.delete}
                              onClick={() => setDeleteId(supplier.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  
                  {/* Mobile: Expandable Action Grid Row */}
                  {isMobile && isExpanded && (
                    <TableRow key={`${supplier.id}-actions`} className="bg-muted/20 border-b">
                      <TableCell colSpan={6} className="p-2">
                        <div className="grid grid-cols-3 gap-1">
                          {actionItems.map((action, idx) => {
                            if (action.type === 'edit') {
                              return (
                                <AddSupplierDialog
                                  key={idx}
                                  supplier={supplier}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      disabled={action.disabled}
                                      className="flex flex-col h-auto py-2 px-1 gap-1 w-full hover:bg-background/80"
                                    >
                                      <action.icon className={cn("h-5 w-5", action.color)} />
                                      <span className="text-[10px] text-muted-foreground leading-tight text-center">{action.label}</span>
                                    </Button>
                                  }
                                />
                              );
                            }
                            if (action.type === 'paymentHistory') {
                              return (
                                <SupplierPaymentHistoryDialog
                                  key={idx}
                                  supplier={supplier}
                                  payments={payments}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      className="flex flex-col h-auto py-2 px-1 gap-1 w-full hover:bg-background/80"
                                    >
                                      <action.icon className={cn("h-5 w-5", action.color)} />
                                      <span className="text-[10px] text-muted-foreground leading-tight text-center">{action.label}</span>
                                    </Button>
                                  }
                                />
                              );
                            }
                            if (action.type === 'purchaseHistory') {
                              return (
                                <SupplierPurchaseHistoryDialog
                                  key={idx}
                                  supplier={supplier}
                                  purchases={purchases}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      className="flex flex-col h-auto py-2 px-1 gap-1 w-full hover:bg-background/80"
                                    >
                                      <action.icon className={cn("h-5 w-5", action.color)} />
                                      <span className="text-[10px] text-muted-foreground leading-tight text-center">{action.label}</span>
                                    </Button>
                                  }
                                />
                              );
                            }
                            return (
                              <Button
                                key={idx}
                                variant="ghost"
                                disabled={action.disabled}
                                onClick={() => {
                                  action.onClick?.();
                                  setExpandedSupplierId(null);
                                }}
                                className="flex flex-col h-auto py-2 px-1 gap-1 hover:bg-background/80 disabled:opacity-40"
                              >
                                <action.icon className={cn("h-5 w-5", action.color)} />
                                <span className="text-[10px] text-muted-foreground leading-tight text-center">{action.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
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