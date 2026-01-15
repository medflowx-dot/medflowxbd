import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useCustomerDueReport } from '@/hooks/useReports';
import { generateCustomerDuePDF } from '@/lib/pdfGenerator';
import { Loader2, Download, Users } from 'lucide-react';
import { format } from 'date-fns';

export function CustomerDueReportView() {
  const { data, isLoading } = useCustomerDueReport();
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      generateCustomerDuePDF(data);
    } finally {
      setExporting(false);
    }
  };

  const totalDue = data?.reduce((acc, row) => acc + row.total_due, 0) || 0;

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
            <Users className="h-5 w-5" />
            Customer Due Report
          </CardTitle>
          <CardDescription>
            All customers with outstanding dues
          </CardDescription>
        </div>
        <Button onClick={handleExport} disabled={!data?.length || exporting}>
          {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Export PDF
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="p-4 rounded-lg bg-red-500/10">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">৳{totalDue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Customers with Dues</p>
            <p className="text-2xl font-bold">{data?.length || 0}</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Total Due</TableHead>
                <TableHead>Last Purchase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No customers with outstanding dues
                  </TableCell>
                </TableRow>
              ) : (
                data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      ৳{customer.total_due.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.last_purchase_date 
                        ? format(new Date(customer.last_purchase_date), 'MMM dd, yyyy')
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
