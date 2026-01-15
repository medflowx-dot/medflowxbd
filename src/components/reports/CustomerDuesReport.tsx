import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomers, useCustomerWithPayments, generateWhatsAppMessage, shareViaWhatsApp } from '@/hooks/useCustomerDues';
import { generateCustomerDuesPDF } from '@/lib/pdfGenerator';
import { Download, MessageSquare, Search, Users, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import type { ReportDateRange } from '@/hooks/useReports';

interface CustomerDuesReportProps {
  dateRange: ReportDateRange;
}

export function CustomerDuesReportView({ dateRange }: CustomerDuesReportProps) {
  const { data: customers, isLoading } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  // Filter customers with dues
  const customersWithDues = customers?.filter(c => c.total_due > 0) || [];
  
  // Apply search filter
  const filteredCustomers = customersWithDues.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalDue = filteredCustomers.reduce((sum, c) => sum + c.total_due, 0);
  const customersCount = filteredCustomers.length;

  const handleExportPDF = () => {
    if (filteredCustomers.length === 0) return;
    generateCustomerDuesPDF(filteredCustomers);
  };

  const handleWhatsAppShare = (customer: typeof filteredCustomers[0]) => {
    shareViaWhatsApp(customer);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers with Dues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">৳{totalDue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Customer Dues Breakdown</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={filteredCustomers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers with outstanding dues found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Total Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <CustomerRow 
                      key={customer.id} 
                      customer={customer}
                      isExpanded={expandedCustomer === customer.id}
                      onToggle={() => setExpandedCustomer(
                        expandedCustomer === customer.id ? null : customer.id
                      )}
                      onWhatsApp={() => handleWhatsAppShare(customer)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface CustomerRowProps {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    total_due: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onWhatsApp: () => void;
}

function CustomerRow({ customer, isExpanded, onToggle, onWhatsApp }: CustomerRowProps) {
  const { data: customerWithPayments, isLoading } = useCustomerWithPayments(
    isExpanded ? customer.id : null
  );

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <TableCell>
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="font-medium">{customer.name}</span>
          </div>
        </TableCell>
        <TableCell>{customer.phone || '-'}</TableCell>
        <TableCell className="text-right">
          <Badge variant="destructive">৳{customer.total_due.toLocaleString()}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onWhatsApp();
            }}
            disabled={!customer.phone}
          >
            <MessageSquare className="h-4 w-4 text-green-600" />
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="bg-muted/30 p-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : customerWithPayments?.payments && customerWithPayments.payments.length > 0 ? (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Payments</h4>
                <div className="grid gap-2">
                  {customerWithPayments.payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm bg-background p-2 rounded">
                      <span>{format(new Date(payment.payment_date), 'MMM dd, yyyy')}</span>
                      <span className="text-muted-foreground">{payment.payment_method}</span>
                      <Badge variant="secondary">৳{payment.amount.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payment history found.</p>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
