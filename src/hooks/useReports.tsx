import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

export interface ReportDateRange {
  start: Date;
  end: Date;
}

export interface DailySummaryReport {
  date: string;
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  salesCount: number;
  dueCollected: number;
  supplierPayments: number;
  dailyCosts: number;
  netCashFlow: number;
}

export interface SalesReportItem {
  id: string;
  invoice_number: string;
  sale_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method: string;
  entry_type: 'quick' | 'detailed';
}

export interface SupplierDueItem {
  id: string;
  name: string;
  phone: string | null;
  total_due: number;
  total_paid: number;
  last_purchase_date: string | null;
}

export function useDailySummaryReport(dateRange: ReportDateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['report-daily-summary', user?.id, dateRange.start, dateRange.end],
    queryFn: async (): Promise<DailySummaryReport[]> => {
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endStr = format(dateRange.end, 'yyyy-MM-dd');

      // Get sales data
      const { data: salesData } = await supabase
        .from('sales')
        .select('sale_date, total_amount, paid_amount, due_amount')
        .gte('sale_date', startStr)
        .lte('sale_date', endStr);

      // Get customer payments
      const { data: customerPayments } = await supabase
        .from('customer_payments')
        .select('payment_date, amount')
        .gte('payment_date', startStr)
        .lte('payment_date', endStr);

      // Get supplier payments
      const { data: supplierPaymentsData } = await supabase
        .from('supplier_payments')
        .select('payment_date, amount')
        .gte('payment_date', startStr)
        .lte('payment_date', endStr);

      // Get daily costs
      const { data: costsData } = await supabase
        .from('daily_costs')
        .select('cost_date, amount')
        .gte('cost_date', startStr)
        .lte('cost_date', endStr);

      // Group by date
      const dateMap = new Map<string, DailySummaryReport>();

      // Process sales
      salesData?.forEach(sale => {
        const date = sale.sale_date;
        const existing = dateMap.get(date) || {
          date,
          totalSales: 0,
          totalPaid: 0,
          totalDue: 0,
          salesCount: 0,
          dueCollected: 0,
          supplierPayments: 0,
          dailyCosts: 0,
          netCashFlow: 0,
        };
        existing.totalSales += Number(sale.total_amount);
        existing.totalPaid += Number(sale.paid_amount);
        existing.totalDue += Number(sale.due_amount);
        existing.salesCount += 1;
        dateMap.set(date, existing);
      });

      // Process customer payments
      customerPayments?.forEach(payment => {
        const date = payment.payment_date;
        const existing = dateMap.get(date) || {
          date,
          totalSales: 0,
          totalPaid: 0,
          totalDue: 0,
          salesCount: 0,
          dueCollected: 0,
          supplierPayments: 0,
          dailyCosts: 0,
          netCashFlow: 0,
        };
        existing.dueCollected += Number(payment.amount);
        dateMap.set(date, existing);
      });

      // Process supplier payments
      supplierPaymentsData?.forEach(payment => {
        const date = payment.payment_date;
        const existing = dateMap.get(date) || {
          date,
          totalSales: 0,
          totalPaid: 0,
          totalDue: 0,
          salesCount: 0,
          dueCollected: 0,
          supplierPayments: 0,
          dailyCosts: 0,
          netCashFlow: 0,
        };
        existing.supplierPayments += Number(payment.amount);
        dateMap.set(date, existing);
      });

      // Process costs
      costsData?.forEach(cost => {
        const date = cost.cost_date;
        const existing = dateMap.get(date) || {
          date,
          totalSales: 0,
          totalPaid: 0,
          totalDue: 0,
          salesCount: 0,
          dueCollected: 0,
          supplierPayments: 0,
          dailyCosts: 0,
          netCashFlow: 0,
        };
        existing.dailyCosts += Number(cost.amount);
        dateMap.set(date, existing);
      });

      // Calculate net cash flow
      dateMap.forEach((value) => {
        value.netCashFlow = value.totalPaid + value.dueCollected - value.supplierPayments - value.dailyCosts;
      });

      return Array.from(dateMap.values()).sort((a, b) => b.date.localeCompare(a.date));
    },
    enabled: !!user?.id,
  });
}

export function useSalesReport(dateRange: ReportDateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['report-sales', user?.id, dateRange.start, dateRange.end],
    queryFn: async (): Promise<SalesReportItem[]> => {
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endStr = format(dateRange.end, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('sales')
        .select('id, invoice_number, sale_date, total_amount, paid_amount, due_amount, payment_method, entry_type')
        .gte('sale_date', startStr)
        .lte('sale_date', endStr)
        .order('sale_date', { ascending: false });

      if (error) throw error;

      return data?.map(sale => ({
        id: sale.id,
        invoice_number: sale.invoice_number,
        sale_date: sale.sale_date,
        total_amount: Number(sale.total_amount),
        paid_amount: Number(sale.paid_amount),
        due_amount: Number(sale.due_amount),
        payment_method: sale.payment_method,
        entry_type: (sale.entry_type as 'quick' | 'detailed') || 'detailed',
      })) || [];
    },
    enabled: !!user?.id,
  });
}

export function useSupplierDueReport() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['report-supplier-dues', user?.id],
    queryFn: async (): Promise<SupplierDueItem[]> => {
      // Get suppliers with dues
      const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('id, name, phone, total_due, total_paid')
        .gt('total_due', 0)
        .order('total_due', { ascending: false });

      if (error) throw error;

      // Get last purchase date for each supplier
      const result: SupplierDueItem[] = [];
      for (const supplier of suppliers || []) {
        const { data: lastPurchase } = await supabase
          .from('supplier_purchases')
          .select('purchase_date')
          .eq('supplier_id', supplier.id)
          .order('purchase_date', { ascending: false })
          .limit(1)
          .single();

        result.push({
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
          total_due: Number(supplier.total_due),
          total_paid: Number(supplier.total_paid),
          last_purchase_date: lastPurchase?.purchase_date || null,
        });
      }

      return result;
    },
    enabled: !!user?.id,
  });
}

// Utility functions for date ranges
export function getDateRangePresets() {
  const today = new Date();
  
  return {
    today: {
      label: 'Today',
      start: startOfDay(today),
      end: endOfDay(today),
    },
    thisWeek: {
      label: 'This Week',
      start: startOfWeek(today, { weekStartsOn: 0 }),
      end: endOfWeek(today, { weekStartsOn: 0 }),
    },
    thisMonth: {
      label: 'This Month',
      start: startOfMonth(today),
      end: endOfMonth(today),
    },
    last7Days: {
      label: 'Last 7 Days',
      start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: today,
    },
    last30Days: {
      label: 'Last 30 Days',
      start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: today,
    },
  };
}
