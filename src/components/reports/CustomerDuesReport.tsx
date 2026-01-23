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
import { useLanguage } from '@/contexts/LanguageContext';
import type { ReportDateRange } from '@/hooks/useReports';

interface CustomerDuesReportProps {
  dateRange: ReportDateRange;
}

export function CustomerDuesReportView({ dateRange }: CustomerDuesReportProps) {
  const { data: customers, isLoading } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const { t } = useLanguage();

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
              {t.reports.customersWithDues}
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
              {t.reports.totalOutstanding}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">৳{totalDue > 0 ? totalDue.toLocaleString() : '0'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">{t.reports.customerDuesBreakdown}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.reports.searchCustomer}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={filteredCustomers.length === 0}
                className="h-auto py-2 px-3 flex flex-col sm:flex-row items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="text-[10px] sm:text-sm">{t.reports.exportPDF}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.reports.noCustomersWithDues}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.reports.customer}</TableHead>
                    <TableHead>{t.reports.phone}</TableHead>
                    <TableHead className="text-right">{t.reports.totalDue}</TableHead>
                    <TableHead className="text-right">{t.reports.actions}</TableHead>
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
                      t={t}
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
  t: any;
}

function CustomerRow({ customer, isExpanded, onToggle, onWhatsApp, t }: CustomerRowProps) {
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
          {customer.total_due > 0 ? (
            <Badge variant="destructive">৳{customer.total_due.toLocaleString()}</Badge>
          ) : (
            <Badge variant="secondary">৳0</Badge>
          )}
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
            <MessageSquare className="h-4 w-4 text-success" />
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
                <h4 className="font-medium text-sm">{t.reports.recentPayments}</h4>
                <div className="grid gap-2">
                  {customerWithPayments.payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm bg-background p-2 rounded">
                      <span>{format(new Date(payment.payment_date), 'dd MMM yyyy')}</span>
                      <span className="text-muted-foreground">{payment.payment_method}</span>
                      <Badge variant="secondary">৳{payment.amount.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.reports.noPaymentHistory}</p>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
