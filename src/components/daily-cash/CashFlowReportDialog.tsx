import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FileText, Loader2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, eachDayOfInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { generateCashFlowSummaryPDF } from '@/lib/pdfGenerator';
import { useLanguage } from '@/contexts/LanguageContext';

type ReportType = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

interface DailySummaryData {
  date: string;
  openingCash: number;
  salesCashIn: number;
  dueCollected: number;
  supplierPayments: number;
  dailyCosts: number;
  totalIn: number;
  totalOut: number;
  closingCash: number;
}

export function CashFlowReportDialog() {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('this_week');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const getDateRange = (): { start: Date; end: Date } | null => {
    const today = new Date();
    
    switch (reportType) {
      case 'this_week':
        return {
          start: startOfWeek(today, { weekStartsOn: 6 }), // Saturday
          end: endOfWeek(today, { weekStartsOn: 6 }),
        };
      case 'last_week':
        const lastWeek = subWeeks(today, 1);
        return {
          start: startOfWeek(lastWeek, { weekStartsOn: 6 }),
          end: endOfWeek(lastWeek, { weekStartsOn: 6 }),
        };
      case 'this_month':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today),
        };
      case 'last_month':
        const lastMonth = subMonths(today, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: customStartDate, end: customEndDate };
        }
        return null;
      default:
        return null;
    }
  };

  const fetchDailySummary = async (date: Date): Promise<DailySummaryData> => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Get opening cash
    const { data: openingData } = await supabase
      .from('opening_cash')
      .select('amount')
      .eq('cash_date', dateStr)
      .maybeSingle();

    const openingCash = Number(openingData?.amount || 0);

    // Get sales for the day (cash payments only)
    const { data: salesData } = await supabase
      .from('sales')
      .select('paid_amount, payment_method')
      .eq('sale_date', dateStr);

    const salesCashIn = salesData
      ?.filter(s => s.payment_method === 'cash')
      .reduce((sum, s) => sum + Number(s.paid_amount), 0) || 0;

    // Get customer due payments for the day (cash only)
    const { data: duePayments } = await supabase
      .from('customer_payments')
      .select('amount, payment_method')
      .eq('payment_date', dateStr);

    const dueCollected = duePayments
      ?.filter(p => p.payment_method === 'cash')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Get supplier payments for the day (cash only)
    const { data: supplierPaymentsData } = await supabase
      .from('supplier_payments')
      .select('amount, payment_method')
      .eq('payment_date', dateStr);

    const supplierPayments = supplierPaymentsData
      ?.filter(p => p.payment_method === 'cash')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Get daily costs for the day (cash only)
    const { data: costsData } = await supabase
      .from('daily_costs')
      .select('amount, payment_method')
      .eq('cost_date', dateStr);

    const dailyCosts = costsData
      ?.filter(c => c.payment_method === 'cash')
      .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    const totalIn = salesCashIn + dueCollected;
    const totalOut = supplierPayments + dailyCosts;
    const closingCash = openingCash + totalIn - totalOut;

    return {
      date: dateStr,
      openingCash,
      salesCashIn,
      dueCollected,
      supplierPayments,
      dailyCosts,
      totalIn,
      totalOut,
      closingCash,
    };
  };

  const handleGenerateReport = async () => {
    const dateRange = getDateRange();
    if (!dateRange) {
      toast.error(t.dailyCash.invalidDateRange);
      return;
    }

    setLoading(true);
    try {
      // Get all days in the range
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      
      // Fetch summary for each day
      const dailySummaries: DailySummaryData[] = [];
      for (const day of days) {
        const summary = await fetchDailySummary(day);
        dailySummaries.push(summary);
      }

      // Generate PDF
      generateCashFlowSummaryPDF(dailySummaries, dateRange);
      toast.success(t.dailyCash.reportSuccess);
      setOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(t.dailyCash.reportError);
    } finally {
      setLoading(false);
    }
  };

  const reportTypeLabels: Record<ReportType, string> = {
    this_week: t.dailyCash.thisWeek,
    last_week: t.dailyCash.lastWeek,
    this_month: t.dailyCash.thisMonth,
    last_month: t.dailyCash.lastMonth,
    custom: t.dailyCash.customRange,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 sm:flex-none h-auto py-2 flex flex-col sm:flex-row items-center gap-1">
          <FileText className="h-4 w-4" />
          <span className="text-[10px] sm:text-sm">{t.dailyCash.report}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.dailyCash.cashFlowReport}</DialogTitle>
          <DialogDescription>
            {t.dailyCash.cashFlowReportDesc}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t.dailyCash.reportPeriod}</Label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger>
                <SelectValue placeholder={t.dailyCash.selectPeriod} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reportTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reportType === 'custom' && (
            <>
              <div className="grid gap-2">
                <Label>{t.dailyCash.startDate}</Label>
                <DatePicker
                  date={customStartDate}
                  onDateChange={setCustomStartDate}
                  placeholder={t.dailyCash.selectStartDate}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t.dailyCash.endDate}</Label>
                <DatePicker
                  date={customEndDate}
                  onDateChange={setCustomEndDate}
                  placeholder={t.dailyCash.selectEndDate}
                />
              </div>
            </>
          )}

          {/* Preview info */}
          {getDateRange() && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                <strong>{t.dailyCash.period}:</strong>{' '}
                {format(getDateRange()!.start, 'dd MMM yyyy')} - {format(getDateRange()!.end, 'dd MMM yyyy')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {eachDayOfInterval({ start: getDateRange()!.start, end: getDateRange()!.end }).length} {t.dailyCash.days}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t.actions.cancel}
          </Button>
          <Button 
            onClick={handleGenerateReport} 
            disabled={loading || (reportType === 'custom' && (!customStartDate || !customEndDate))}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t.dailyCash.generatePDF}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
