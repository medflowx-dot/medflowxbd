import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, FileText, Users, User } from 'lucide-react';
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

interface SupplierReportsProps {
  dateRange: ReportDateRange;
}

export function SupplierReportsView({ dateRange }: SupplierReportsProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliersList();
  const { data: individualReport, isLoading: individualLoading } = useIndividualSupplierReport(
    selectedSupplierId || null,
    dateRange
  );
  const { data: allSuppliersReport, isLoading: allLoading } = useAllSuppliersReport(dateRange);

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

  const handleExportSingleFromList = async (supplierId: string) => {
    // Fetch individual report for this supplier
    const supplier = allSuppliersReport?.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    // For quick export from list, we'll generate a simplified report
    setSelectedSupplierId(supplierId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          সাপ্লায়ার রিপোর্ট
        </CardTitle>
        <CardDescription>
          প্রতিটি সাপ্লায়ারের আলাদা রিপোর্ট বা সকল সাপ্লায়ারের সামারি রিপোর্ট বের করুন
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Individual Report
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Suppliers
            </TabsTrigger>
          </TabsList>

          {/* Individual Supplier Report */}
          <TabsContent value="individual" className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="সাপ্লায়ার নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {suppliersLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
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
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
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
                      <p className="text-sm text-muted-foreground">Period Purchase</p>
                      <p className="text-xl font-bold text-blue-600">
                        ৳{individualReport.summary.totalPurchases.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {individualReport.summary.purchaseCount} entries
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Period Payment</p>
                      <p className="text-xl font-bold text-green-600">
                        ৳{individualReport.summary.totalPayments.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {individualReport.summary.paymentCount} entries
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-xl font-bold">
                        ৳{individualReport.supplier.total_paid.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Current Due</p>
                      <p className="text-xl font-bold text-red-600">
                        ৳{individualReport.summary.currentDue.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Purchase History */}
                <div>
                  <h4 className="font-semibold mb-2">Purchase History (Selected Period)</h4>
                  {individualReport.purchases.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No purchases in selected period</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Invoice</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-right">Due</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {individualReport.purchases.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell>{format(new Date(purchase.purchase_date), 'dd MMM yyyy')}</TableCell>
                              <TableCell>{purchase.invoice_number || '-'}</TableCell>
                              <TableCell className="text-right">৳{Number(purchase.total_amount).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-green-600">৳{Number(purchase.paid_amount).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-red-600">৳{Number(purchase.due_amount).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="font-semibold mb-2">Payment History (Selected Period)</h4>
                  {individualReport.payments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No payments in selected period</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Reference</TableHead>
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
                <p>সাপ্লায়ার নির্বাচন করুন রিপোর্ট দেখতে</p>
              </div>
            )}
          </TabsContent>

          {/* All Suppliers Report */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleExportAll}
                disabled={!allSuppliersReport || allLoading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export All PDF
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
                      <p className="text-sm text-muted-foreground">Total Suppliers</p>
                      <p className="text-2xl font-bold">{allSuppliersReport.summary.supplierCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Period Purchase</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ৳{allSuppliersReport.summary.totalPurchases.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Period Payment</p>
                      <p className="text-2xl font-bold text-green-600">
                        ৳{allSuppliersReport.summary.totalPayments.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Total Due</p>
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
                        <TableHead>Supplier</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Purchases</TableHead>
                        <TableHead className="text-right">Payments</TableHead>
                        <TableHead className="text-right">Current Due</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
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
                              <Badge variant="outline" className="bg-green-50 text-green-700">Paid</Badge>
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
                              View
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
                    <p>No suppliers found</p>
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
