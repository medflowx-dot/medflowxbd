import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CashFlowSummary } from '@/components/daily-cash/CashFlowSummary';
import { DailyTransactionsList } from '@/components/daily-cash/DailyTransactionsList';
import { AddCostDialog } from '@/components/daily-cash/AddCostDialog';
import { SetOpeningCashDialog } from '@/components/daily-cash/SetOpeningCashDialog';
import { CalendarIcon, Wallet, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDailyCashSummary, useDailySales, useDailyCustomerPayments, useDailySupplierPayments, useDailyCosts } from '@/hooks/useDailyCash';
import { generateDailyClosingCashPDF, type DailyTransaction } from '@/lib/pdfGenerator';

export default function DailyCash() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exporting, setExporting] = useState(false);

  const { data: summary } = useDailyCashSummary(selectedDate);
  const { data: sales } = useDailySales(selectedDate);
  const { data: customerPayments } = useDailyCustomerPayments(selectedDate);
  const { data: supplierPayments } = useDailySupplierPayments(selectedDate);
  const { data: costs } = useDailyCosts(selectedDate);

  const handleExportPDF = () => {
    if (!summary) return;
    setExporting(true);

    try {
      // Build transactions list (cash only)
      const transactions: DailyTransaction[] = [];

      // Add sales (cash only)
      sales?.forEach(sale => {
        if (sale.payment_method === 'cash') {
          transactions.push({
            id: sale.id,
            type: 'sale',
            description: `Sale ${sale.invoice_number}${sale.customers?.name ? ` - ${sale.customers.name}` : ''}`,
            amount: Number(sale.paid_amount),
            payment_method: sale.payment_method,
            time: format(new Date(sale.created_at), 'HH:mm'),
          });
        }
      });

      // Add customer payments (cash only)
      customerPayments?.forEach(payment => {
        if (payment.payment_method === 'cash') {
          transactions.push({
            id: payment.id,
            type: 'collection',
            description: `Due collection - ${payment.customers?.name || 'Unknown'}`,
            amount: Number(payment.amount),
            payment_method: payment.payment_method,
            time: format(new Date(payment.created_at), 'HH:mm'),
          });
        }
      });

      // Add supplier payments (cash only)
      supplierPayments?.forEach(payment => {
        if (payment.payment_method === 'cash') {
          transactions.push({
            id: payment.id,
            type: 'supplier_payment',
            description: `Supplier payment - ${payment.suppliers?.name || 'Unknown'}`,
            amount: Number(payment.amount),
            payment_method: payment.payment_method,
            time: format(new Date(payment.created_at), 'HH:mm'),
          });
        }
      });

      // Add costs (cash only)
      costs?.forEach(cost => {
        if (cost.payment_method === 'cash') {
          transactions.push({
            id: cost.id,
            type: 'cost',
            description: `${cost.category}: ${cost.description}`,
            amount: Number(cost.amount),
            payment_method: cost.payment_method,
            time: format(new Date(cost.created_at), 'HH:mm'),
          });
        }
      });

      // Sort by time
      transactions.sort((a, b) => a.time.localeCompare(b.time));

      generateDailyClosingCashPDF(summary, transactions, selectedDate);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Daily Cash</h1>
            <p className="text-muted-foreground">
              Auto-calculated cash flow from all transactions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <SetOpeningCashDialog date={selectedDate} />
          <AddCostDialog date={selectedDate} />
          
          {/* Export PDF Button */}
          <Button 
            onClick={handleExportPDF} 
            disabled={!summary || exporting}
            variant="outline"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Cash flow is auto-calculated from sales, due collections, supplier payments, and daily costs. 
          Only <strong>cash transactions</strong> are counted. You can only manually set the opening cash and add daily costs.
        </p>
      </div>

      {/* Cash Flow Summary Cards */}
      <CashFlowSummary date={selectedDate} />

      {/* Transactions List */}
      <DailyTransactionsList date={selectedDate} />
    </div>
  );
}
