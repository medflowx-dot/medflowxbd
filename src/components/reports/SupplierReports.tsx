import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, FileText, Users, User, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ReportDateRange } from '@/hooks/useReports';
import { 
  useIndividualSupplierReport, 
  useAllSuppliersReport, 
  useSuppliersList 
} from '@/hooks/useSupplierReports';
import { 
  generateIndividualSupplierPDF, 
  generateAllSuppliersPDF 
} from '@/lib/pdfGenerator';
import { useLanguage } from '@/contexts/LanguageContext';
import { EditPurchaseDialog } from '@/components/suppliers/EditPurchaseDialog';
import { useSuppliers } from '@/hooks/useSuppliers';
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

interface SupplierReportsProps {
  dateRange: ReportDateRange;
}

export function SupplierReportsView({ dateRange }: SupplierReportsProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const { t } = useLanguage();
  
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliersList();
  const { data: individualReport, isLoading: individualLoading } = useIndividualSupplierReport(
    selectedSupplierId || null,
    dateRange
  );
  const { data: allSuppliersReport, isLoading: allLoading } = useAllSuppliersReport(dateRange);

  const { deletePurchase } = useSuppliers();

  const handleExportIndividual = () => {
    if (individualReport) {
      generateIndividualSupplierPDF(individualReport, dateRange);
    }
  };

  const handleExportAll = () => {
    if (allSuppliersReport) {
      generateAllSuppliersPDF(allSuppliersReport, dateRange);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t.reports.supplierReportsTitle}
        </CardTitle>
        <CardDescription>
          {t.reports.supplierReportsDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t.reports.individualReport}
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t.reports.allSuppliers}
            </TabsTrigger>
          </TabsList>

          {/* Individual Supplier Report */}
          <TabsContent value="individual" className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder={t.reports.selectSupplier} />
                </SelectTrigger>
                <SelectContent>
                  {suppliersLoading ? (
                    <SelectItem value="loading" disabled>{t.reports.loading}</SelectItem>
                  ) : (
                    suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleExportIndividual}
                disabled={!individualReport || individualLoading}
                className="h-auto py-2 px-3 flex flex-col sm:flex-row items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="text-[10px] sm:text-sm">{t.reports.exportPDF}</span>
              </Button>
            </div>

            {individualLoading && selectedSupplierId && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {individualReport && (
              <div className="space-y-6">
                {/* Supplier Info */}
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-lg">{individualReport.supplier.name}</h3>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    {individualReport.supplier.phone && <p>📞 {individualReport.supplier.phone}</p>}
                    {individualReport.supplier.address && <p>📍 {individualReport.supplier.address}</p>}
                    {individualReport.supplier.contact_person && <p>👤 {individualReport.supplier.contact_person}</p>}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.periodPurchase}</p>
                      <p className="text-xl font-bold text-blue-600">
                        ৳{individualReport.summary.totalPurchases.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {individualReport.summary.purchaseCount} {t.reports.entries}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.periodPayment}</p>
                      <p className="text-xl font-bold text-green-600">
                        ৳{individualReport.summary.totalPayments.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {individualReport.summary.paymentCount} {t.reports.entries}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.totalPaid}</p>
                      <p className="text-xl font-bold">
                        ৳{individualReport.supplier.total_paid.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.currentDue}</p>
                      <p className="text-xl font-bold text-red-600">
                        ৳{individualReport.summary.currentDue.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Purchase History */}
                <div>
                  <h4 className="font-semibold mb-2">{t.reports.purchaseHistory}</h4>
                  {individualReport.purchases.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">{t.reports.noPurchasesInPeriod}</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t.reports.date}</TableHead>
                            <TableHead>{t.reports.invoice}</TableHead>
                            <TableHead className="text-right">{t.reports.amount}</TableHead>
                            <TableHead className="text-right">{t.reports.paid}</TableHead>
                            <TableHead className="text-right">{t.reports.due}</TableHead>
                            <TableHead className="text-right w-20">{t.medicines?.actions || 'Actions'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {individualReport.purchases.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell>{format(new Date(purchase.purchase_date), 'dd MMM yyyy')}</TableCell>
                              <TableCell>{purchase.invoice_number || '-'}</TableCell>
                              <TableCell className="text-right">৳{Number(purchase.total_amount).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-success">৳{Number(purchase.paid_amount).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-destructive">৳{Number(purchase.due_amount).toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <EditPurchaseDialog
                                    purchase={{
                                      id: purchase.id,
                                      supplier_id: selectedSupplierId,
                                      purchase_date: purchase.purchase_date,
                                      invoice_number: purchase.invoice_number,
                                      total_amount: Number(purchase.total_amount),
                                      paid_amount: Number(purchase.paid_amount),
                                      due_amount: Number(purchase.due_amount),
                                      notes: purchase.notes,
                                      supplier: suppliers?.find(s => s.id === selectedSupplierId),
                                    }}
                                    trigger={
                                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10">
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    }
                                  />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>{t.suppliers?.deletePurchase || 'Delete Purchase'}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {t.suppliers?.deletePurchaseConfirm || 'Are you sure you want to delete this purchase? This action cannot be undone.'}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>{t.actions?.cancel || 'Cancel'}</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deletePurchase(purchase.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          {t.actions?.delete || 'Delete'}
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
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="font-semibold mb-2">{t.reports.paymentHistory}</h4>
                  {individualReport.payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">{t.reports.noPaymentsInPeriod}</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t.reports.date}</TableHead>
                            <TableHead className="text-right">{t.reports.amount}</TableHead>
                            <TableHead>{t.reports.method}</TableHead>
                            <TableHead>{t.reports.reference}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {individualReport.payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</TableCell>
                              <TableCell className="text-right text-green-600">৳{Number(payment.amount).toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{payment.payment_method}</Badge>
                              </TableCell>
                              <TableCell>{payment.reference_number || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!selectedSupplierId && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t.reports.selectSupplierToView}</p>
              </div>
            )}
          </TabsContent>

          {/* All Suppliers Report */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleExportAll}
                disabled={!allSuppliersReport || allLoading}
                className="h-auto py-2 px-3 flex flex-col sm:flex-row items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="text-[10px] sm:text-sm">{t.reports.exportAllPDF}</span>
              </Button>
            </div>

            {allLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : allSuppliersReport ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.totalSuppliers}</p>
                      <p className="text-2xl font-bold">{allSuppliersReport.summary.supplierCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.periodPurchase}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ৳{allSuppliersReport.summary.totalPurchases.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.periodPayment}</p>
                      <p className="text-2xl font-bold text-green-600">
                        ৳{allSuppliersReport.summary.totalPayments.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t.reports.totalDue}</p>
                      <p className="text-2xl font-bold text-red-600">
                        ৳{allSuppliersReport.summary.totalDue.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Suppliers Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.reports.supplier}</TableHead>
                        <TableHead>{t.reports.phone}</TableHead>
                        <TableHead className="text-right">{t.reports.purchases}</TableHead>
                        <TableHead className="text-right">{t.reports.payments}</TableHead>
                        <TableHead className="text-right">{t.reports.currentDue}</TableHead>
                        <TableHead className="text-center">{t.reports.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allSuppliersReport.suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.phone || '-'}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-blue-600">৳{supplier.purchaseAmount.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({supplier.purchaseCount})
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-green-600">৳{supplier.paidAmount.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({supplier.paymentCount})
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {supplier.dueAmount > 0 ? (
                              <span className="text-red-600 font-medium">৳{supplier.dueAmount.toLocaleString()}</span>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700">{t.reports.paid}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSupplierId(supplier.id)}
                              className="gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              {t.reports.view}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {allSuppliersReport.suppliers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t.reports.noSuppliersFound}</p>
                  </div>
                )}
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
