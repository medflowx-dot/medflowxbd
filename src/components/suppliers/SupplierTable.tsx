import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Pencil, Trash2, CreditCard, Phone, Mail, Building2, Plus, FileText } from 'lucide-react';
import { Supplier, useSuppliers } from '@/hooks/useSuppliers';
import { useManufacturers } from '@/hooks/useManufacturers';
import { AddSupplierDialog } from './AddSupplierDialog';
import { SupplierPaymentDialog } from './SupplierPaymentDialog';
import { QuickReportDialog } from '@/components/reports/QuickReportDialog';
import { supabase } from '@/integrations/supabase/client';
import { generateIndividualSupplierPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

interface SupplierTableProps {
  suppliers: Supplier[];
  searchQuery: string;
}

export function SupplierTable({ suppliers, searchQuery }: SupplierTableProps) {
  const { deleteSupplier, updateSupplier } = useSuppliers();
  const { manufacturers } = useManufacturers();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleQuickReportClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setReportDialogOpen(true);
  };

  const handleGenerateReport = async (dateRange: { start: Date; end: Date }) => {
    if (!selectedSupplier) return;

    const startDate = dateRange.start.toISOString().split('T')[0];
    const endDate = dateRange.end.toISOString().split('T')[0];

    // Fetch purchases in date range
    const { data: purchases, error: purchasesError } = await supabase
      .from('supplier_purchases')
      .select('id, purchase_date, invoice_number, total_amount, paid_amount, due_amount, notes')
      .eq('supplier_id', selectedSupplier.id)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDate)
      .order('purchase_date', { ascending: false });

    if (purchasesError) throw purchasesError;

    // Fetch payments in date range
    const { data: payments, error: paymentsError } = await supabase
      .from('supplier_payments')
      .select('id, payment_date, amount, payment_method, reference_number, notes')
      .eq('supplier_id', selectedSupplier.id)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;

    // Calculate summary
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
    toast.success('PDF রিপোর্ট ডাউনলোড হয়েছে');
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
        {searchQuery ? 'No suppliers found matching your search.' : 'No suppliers added yet.'}
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead className="hidden md:table-cell">Manufacturer</TableHead>
              <TableHead className="hidden sm:table-cell">Contact</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="text-right">Total Due</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div>
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
                          <span className="text-xs">Saving...</span>
                        ) : supplier.manufacturer?.name ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {supplier.manufacturer.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs">
                            <Plus className="h-3 w-3" />
                            Set Manufacturer
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
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
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
                  <span className="text-green-600">৳{supplier.total_paid.toFixed(2)}</span>
                </TableCell>
                <TableCell className="text-right">
                  {supplier.total_due > 0 ? (
                    <Badge variant="destructive">৳{supplier.total_due.toFixed(2)}</Badge>
                  ) : (
                    <Badge variant="secondary">৳0.00</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      title="Quick Report"
                      onClick={() => handleQuickReportClick(supplier)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    {supplier.total_due > 0 && (
                      <SupplierPaymentDialog
                        supplier={supplier}
                        trigger={
                          <Button size="icon" variant="ghost" title="Record Payment">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        }
                      />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <AddSupplierDialog
                          supplier={supplier}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this supplier and all their payment history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QuickReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        title={`Supplier Report: ${selectedSupplier?.name || ''}`}
        description="Select a date range for the report"
        onGenerate={handleGenerateReport}
      />
    </>
  );
}
