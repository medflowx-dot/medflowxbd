import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useSupplierDueReport } from '@/hooks/useReports';
import { generateSupplierDuePDF } from '@/lib/pdfGenerator';
import { Loader2, Download, Truck } from 'lucide-react';
import { format } from 'date-fns';

export function SupplierDueReportView() {
  const { data, isLoading } = useSupplierDueReport();
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      generateSupplierDuePDF(data);
    } finally {
      setExporting(false);
    }
  };

  const totalDue = data?.reduce((acc, row) => acc + row.total_due, 0) || 0;
  const totalPaid = data?.reduce((acc, row) => acc + row.total_paid, 0) || 0;

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
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Supplier Due Report
          </CardTitle>
          <CardDescription>
            All suppliers with outstanding dues
          </CardDescription>
        </div>
        <Button onClick={handleExport} disabled={!data?.length || exporting}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Export PDF
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="p-4 rounded-lg bg-amber-500/10">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">৳{totalDue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10">
            <p className="text-sm text-muted-foreground">Total Paid (All Time)</p>
            <p className="text-2xl font-bold text-green-600">৳{totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Suppliers with Dues</p>
            <p className="text-2xl font-bold">{data?.length || 0}</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Total Due</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead>Last Purchase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No suppliers with outstanding dues
                  </TableCell>
                </TableRow>
              ) : (
                data.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell className="text-right text-amber-600 font-medium">
                      ৳{supplier.total_due.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      ৳{supplier.total_paid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {supplier.last_purchase_date 
                        ? format(new Date(supplier.last_purchase_date), 'MMM dd, yyyy')
                        : '-'}
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
