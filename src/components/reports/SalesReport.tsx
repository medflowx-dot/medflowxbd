import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSalesReport, useMedicineProfitReport, ReportDateRange } from '@/hooks/useReports';
import { generateSalesReportPDF, generateProfitReportPDF } from '@/lib/pdfGenerator';
import { Loader2, Download, Zap, ClipboardList, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { format } from 'date-fns';

interface SalesReportViewProps {
  dateRange: ReportDateRange;
}

export function SalesReportView({ dateRange }: SalesReportViewProps) {
  const { data: salesData, isLoading: salesLoading } = useSalesReport(dateRange);
  const { data: medicineData, isLoading: medicineLoading } = useMedicineProfitReport(dateRange);
  const [exporting, setExporting] = useState(false);

  const handleExportSales = () => {
    if (!salesData) return;
    setExporting(true);
    try {
      generateSalesReportPDF(salesData, dateRange);
    } finally {
      setExporting(false);
    }
  };

  const handleExportProfit = () => {
    if (!medicineData) return;
    setExporting(true);
    try {
      generateProfitReportPDF(medicineData, dateRange);
    } finally {
      setExporting(false);
    }
  };

  // Calculate sales totals
  const salesTotals = salesData?.reduce(
    (acc, row) => ({
      total: acc.total + row.total_amount,
      paid: acc.paid + row.paid_amount,
      due: acc.due + row.due_amount,
      profit: acc.profit + (row.profit || 0),
      cost: acc.cost + (row.cost || 0),
    }),
    { total: 0, paid: 0, due: 0, profit: 0, cost: 0 }
  ) || { total: 0, paid: 0, due: 0, profit: 0, cost: 0 };

  // Calculate medicine profit totals
  const medicineTotals = medicineData?.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.total_revenue,
      cost: acc.cost + row.total_cost,
      profit: acc.profit + row.profit,
      quantity: acc.quantity + row.total_quantity,
    }),
    { revenue: 0, cost: 0, profit: 0, quantity: 0 }
  ) || { revenue: 0, cost: 0, profit: 0, quantity: 0 };

  const isLoading = salesLoading || medicineLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
            <CardTitle className="text-xl">৳{salesTotals.total.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid</CardDescription>
            <CardTitle className="text-xl text-green-600">৳{salesTotals.paid.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unpaid Balance</CardDescription>
            <CardTitle className="text-xl text-orange-600">৳{salesTotals.due.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              {salesTotals.profit >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              Total Profit
            </CardDescription>
            <CardTitle className={`text-xl ${salesTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {salesTotals.profit >= 0 ? '+' : ''}৳{salesTotals.profit.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profit Margin</CardDescription>
            <CardTitle className={`text-xl ${salesTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {salesTotals.cost > 0 ? ((salesTotals.profit / salesTotals.cost) * 100).toFixed(1) : 0}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Entries</TabsTrigger>
          <TabsTrigger value="medicine-profit">Profit by Medicine</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Report</CardTitle>
                <CardDescription>
                  {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
                </CardDescription>
              </div>
              <Button onClick={handleExportSales} disabled={!salesData?.length || exporting}>
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entry ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!salesData?.length ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No sales for selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesData.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-sm">{sale.invoice_number}</TableCell>
                          <TableCell>
                            {sale.entry_type === 'quick' ? (
                              <Badge variant="secondary" className="gap-1">
                                <Zap className="h-3 w-3" />
                                Quick
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <ClipboardList className="h-3 w-3" />
                                Detailed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-right">৳{sale.total_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {sale.cost !== undefined ? `৳${sale.cost.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            sale.profit !== undefined 
                              ? sale.profit >= 0 ? 'text-green-600' : 'text-red-600'
                              : ''
                          }`}>
                            {sale.profit !== undefined 
                              ? `${sale.profit >= 0 ? '+' : ''}৳${sale.profit.toLocaleString()}`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{sale.payment_method}</Badge>
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

        <TabsContent value="medicine-profit">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Profit Analysis by Medicine
                </CardTitle>
                <CardDescription>
                  Breakdown of profit margins for each medicine sold (Detailed sales only)
                </CardDescription>
              </div>
              <Button onClick={handleExportProfit} disabled={!medicineData?.length || exporting}>
                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export PDF
              </Button>
            </CardHeader>
            <CardContent>
              {/* Medicine Profit Summary */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 rounded-lg bg-primary/10">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">৳{medicineTotals.revenue.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold">৳{medicineTotals.cost.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className={`text-xl font-bold ${medicineTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {medicineTotals.profit >= 0 ? '+' : ''}৳{medicineTotals.profit.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                  <p className="text-xl font-bold">{medicineTotals.quantity.toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-right">Qty Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Margin %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!medicineData?.length ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No detailed sales for selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      medicineData.map((medicine) => (
                        <TableRow key={medicine.medicine_id}>
                          <TableCell className="font-medium">{medicine.medicine_name}</TableCell>
                          <TableCell className="text-right">{medicine.total_quantity}</TableCell>
                          <TableCell className="text-right">৳{medicine.total_revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            ৳{medicine.total_cost.toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            medicine.profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {medicine.profit >= 0 ? '+' : ''}৳{medicine.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-right ${
                            medicine.margin_percent >= 20 ? 'text-green-600' : 
                            medicine.margin_percent >= 10 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            <Badge variant={
                              medicine.margin_percent >= 20 ? 'default' : 
                              medicine.margin_percent >= 10 ? 'secondary' : 'destructive'
                            }>
                              {medicine.margin_percent.toFixed(1)}%
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
      </Tabs>
    </div>
  );
}