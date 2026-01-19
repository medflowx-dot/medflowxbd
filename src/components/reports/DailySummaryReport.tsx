import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useDailySummaryReport, ReportDateRange } from '@/hooks/useReports';
import { generateDailySummaryPDF } from '@/lib/pdfGenerator';
import { Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface DailySummaryReportProps {
  dateRange: ReportDateRange;
}

export function DailySummaryReportView({ dateRange }: DailySummaryReportProps) {
  const { data, isLoading } = useDailySummaryReport(dateRange);
  const [exporting, setExporting] = useState(false);
  const { t } = useLanguage();

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      generateDailySummaryPDF(data, dateRange);
    } finally {
      setExporting(false);
    }
  };

  // Calculate totals
  const totals = data?.reduce(
    (acc, row) => ({
      totalSales: acc.totalSales + row.totalSales,
      totalPaid: acc.totalPaid + row.totalPaid,
      totalDue: acc.totalDue + row.totalDue,
      salesCount: acc.salesCount + row.salesCount,
      dueCollected: acc.dueCollected + row.dueCollected,
      supplierPayments: acc.supplierPayments + row.supplierPayments,
      dailyCosts: acc.dailyCosts + row.dailyCosts,
      netCashFlow: acc.netCashFlow + row.netCashFlow,
    }),
    {
      totalSales: 0,
      totalPaid: 0,
      totalDue: 0,
      salesCount: 0,
      dueCollected: 0,
      supplierPayments: 0,
      dailyCosts: 0,
      netCashFlow: 0,
    }
  ) || { totalSales: 0, totalPaid: 0, totalDue: 0, salesCount: 0, dueCollected: 0, supplierPayments: 0, dailyCosts: 0, netCashFlow: 0 };

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
          <CardTitle>{t.reports.dailySummaryReport}</CardTitle>
          <CardDescription>
            {format(dateRange.start, 'MMM dd, yyyy')} - {format(dateRange.end, 'MMM dd, yyyy')}
          </CardDescription>
        </div>
        <Button onClick={handleExport} disabled={!data?.length || exporting}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {t.reports.exportPDF}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="p-4 rounded-lg bg-primary/10">
            <p className="text-sm text-muted-foreground">{t.reports.totalSales}</p>
            <p className="text-xl font-bold">৳{totals.totalSales.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10">
            <p className="text-sm text-muted-foreground">{t.reports.totalPaid}</p>
            <p className="text-xl font-bold text-green-600">৳{totals.totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground">{t.reports.totalDue}</p>
            <p className="text-xl font-bold text-red-600">৳{totals.totalDue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10">
            <p className="text-sm text-muted-foreground">{t.reports.netCashFlow}</p>
            <p className={`text-xl font-bold ${totals.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{totals.netCashFlow.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.reports.date}</TableHead>
                <TableHead className="text-right">{t.reports.sales}</TableHead>
                <TableHead className="text-right">{t.reports.paid}</TableHead>
                <TableHead className="text-right">{t.reports.due}</TableHead>
                <TableHead className="text-right">{t.reports.dueCollected}</TableHead>
                <TableHead className="text-right">{t.reports.supplierPay}</TableHead>
                <TableHead className="text-right">{t.reports.costs}</TableHead>
                <TableHead className="text-right">{t.reports.netFlow}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t.reports.noDataForPeriod}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">
                      {format(new Date(row.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">৳{row.totalSales.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">৳{row.totalPaid.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">৳{row.totalDue.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">৳{row.dueCollected.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">৳{row.supplierPayments.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">৳{row.dailyCosts.toLocaleString()}</TableCell>
                    <TableCell className={`text-right font-medium ${row.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ৳{row.netCashFlow.toLocaleString()}
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
