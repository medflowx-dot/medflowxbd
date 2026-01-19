import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSalesReport, ReportDateRange } from '@/hooks/useReports';
import { generateSalesReportPDF } from '@/lib/pdfGenerator';
import { Loader2, Download, Zap, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface SalesReportViewProps {
  dateRange: ReportDateRange;
}

export function SalesReportView({ dateRange }: SalesReportViewProps) {
  const { data: salesData, isLoading } = useSalesReport(dateRange);
  const [exporting, setExporting] = useState(false);
  const { t } = useLanguage();

  const handleExportSales = () => {
    if (!salesData) return;
    setExporting(true);
    try {
      generateSalesReportPDF(salesData, dateRange);
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.reports.totalSales}</CardDescription>
            <CardTitle className="text-xl">৳{salesTotals.total.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.reports.totalPaid}</CardDescription>
            <CardTitle className="text-xl text-green-600">৳{salesTotals.paid.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.reports.unpaidBalance}</CardDescription>
            <CardTitle className="text-xl text-orange-600">৳{salesTotals.due.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t.reports.salesReport}</CardTitle>
            <CardDescription>
              {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
            </CardDescription>
          </div>
          <Button onClick={handleExportSales} disabled={!salesData?.length || exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {t.reports.exportPDF}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.reports.entryId}</TableHead>
                  <TableHead>{t.reports.type}</TableHead>
                  <TableHead>{t.reports.date}</TableHead>
                  <TableHead className="text-right">{t.reports.total}</TableHead>
                  <TableHead className="text-right">{t.reports.paid}</TableHead>
                  <TableHead className="text-right">{t.reports.due}</TableHead>
                  <TableHead>{t.reports.method}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!salesData?.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t.reports.noSalesForPeriod}
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
                            {t.reports.quick}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <ClipboardList className="h-3 w-3" />
                            {t.reports.detailed}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(sale.sale_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">৳{sale.total_amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600">৳{sale.paid_amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-orange-600">
                        {sale.due_amount > 0 ? `৳${sale.due_amount.toLocaleString()}` : '-'}
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
    </div>
  );
}
