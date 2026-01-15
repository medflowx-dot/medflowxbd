import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSalesReport, ReportDateRange } from '@/hooks/useReports';
import { generateSalesReportPDF } from '@/lib/pdfGenerator';
import { Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';

interface SalesReportViewProps {
  dateRange: ReportDateRange;
}

export function SalesReportView({ dateRange }: SalesReportViewProps) {
  const { data, isLoading } = useSalesReport(dateRange);
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      generateSalesReportPDF(data, dateRange);
    } finally {
      setExporting(false);
    }
  };

  // Calculate totals
  const totals = data?.reduce(
    (acc, row) => ({
      total: acc.total + row.total_amount,
      paid: acc.paid + row.paid_amount,
      due: acc.due + row.due_amount,
    }),
    { total: 0, paid: 0, due: 0 }
  ) || { total: 0, paid: 0, due: 0 };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sales Report</CardTitle>
          <CardDescription>
            {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
          </CardDescription>
        </div>
        <Button onClick={handleExport} disabled={!data?.length || exporting}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Export PDF
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="p-4 rounded-lg bg-primary/10">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-xl font-bold">৳{totals.total.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-xl font-bold text-green-600">৳{totals.paid.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground">Total Due</p>
            <p className="text-xl font-bold text-red-600">৳{totals.due.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Number of Sales</p>
            <p className="text-xl font-bold">{data?.length || 0}</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No sales for selected period
                  </TableCell>
                </TableRow>
              ) : (
                data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm">{sale.invoice_number}</TableCell>
                    <TableCell>{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell className="text-right">৳{sale.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">৳{sale.paid_amount.toLocaleString()}</TableCell>
                    <TableCell className={`text-right ${sale.due_amount > 0 ? 'text-red-600' : ''}`}>
                      ৳{sale.due_amount.toLocaleString()}
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
  );
}
