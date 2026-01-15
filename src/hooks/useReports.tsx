import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInDays, subDays } from 'date-fns';

export interface ReportDateRange {
  start: Date;
  end: Date;
}

export interface DailyProfitData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  salesCount: number;
}

export interface ProfitTrendData {
  dailyData: DailyProfitData[];
  comparison: {
    currentPeriod: { dayIndex: number; profit: number; date: string }[];
    previousPeriod: { dayIndex: number; profit: number; date: string }[];
  };
  summary: {
    currentProfit: number;
    previousProfit: number;
    changePercent: number;
    avgDailyProfit: number;
    avgPreviousDailyProfit: number;
  };
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
  profit?: number;
  cost?: number;
}

export interface MedicineProfitItem {
  medicine_id: string;
  medicine_name: string;
  total_quantity: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  margin_percent: number;
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

      // Get sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, invoice_number, sale_date, total_amount, paid_amount, due_amount, payment_method, entry_type')
        .gte('sale_date', startStr)
        .lte('sale_date', endStr)
        .order('sale_date', { ascending: false });

      if (salesError) throw salesError;

      // Get sale items with purchase prices for profit calculation
      const saleIds = salesData?.map(s => s.id) || [];
      let profitBySale: Record<string, { revenue: number; cost: number }> = {};

      if (saleIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('sale_items')
          .select('sale_id, quantity, total_price, purchase_price')
          .in('sale_id', saleIds);

        if (itemsData) {
          itemsData.forEach(item => {
            if (!profitBySale[item.sale_id]) {
              profitBySale[item.sale_id] = { revenue: 0, cost: 0 };
            }
            profitBySale[item.sale_id].revenue += Number(item.total_price);
            profitBySale[item.sale_id].cost += Number(item.purchase_price) * item.quantity;
          });
        }
      }

      return salesData?.map(sale => {
        const profitData = profitBySale[sale.id];
        return {
          id: sale.id,
          invoice_number: sale.invoice_number,
          sale_date: sale.sale_date,
          total_amount: Number(sale.total_amount),
          paid_amount: Number(sale.paid_amount),
          due_amount: Number(sale.due_amount),
          payment_method: sale.payment_method,
          entry_type: (sale.entry_type as 'quick' | 'detailed') || 'detailed',
          profit: profitData ? profitData.revenue - profitData.cost : undefined,
          cost: profitData?.cost,
        };
      }) || [];
    },
    enabled: !!user?.id,
  });
}

export function useMedicineProfitReport(dateRange: ReportDateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['report-medicine-profit', user?.id, dateRange.start, dateRange.end],
    queryFn: async (): Promise<MedicineProfitItem[]> => {
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endStr = format(dateRange.end, 'yyyy-MM-dd');

      // Get sales in date range
      const { data: salesData } = await supabase
        .from('sales')
        .select('id')
        .gte('sale_date', startStr)
        .lte('sale_date', endStr)
        .eq('entry_type', 'detailed');

      const saleIds = salesData?.map(s => s.id) || [];
      
      if (saleIds.length === 0) return [];

      // Get sale items with medicine details
      const { data: itemsData, error } = await supabase
        .from('sale_items')
        .select('medicine_id, medicine_name, quantity, total_price, purchase_price')
        .in('sale_id', saleIds);

      if (error) throw error;

      // Group by medicine
      const medicineMap = new Map<string, MedicineProfitItem>();

      itemsData?.forEach(item => {
        const key = item.medicine_id || item.medicine_name;
        const existing = medicineMap.get(key) || {
          medicine_id: item.medicine_id || 'unknown',
          medicine_name: item.medicine_name,
          total_quantity: 0,
          total_revenue: 0,
          total_cost: 0,
          profit: 0,
          margin_percent: 0,
        };

        existing.total_quantity += item.quantity;
        existing.total_revenue += Number(item.total_price);
        existing.total_cost += Number(item.purchase_price) * item.quantity;
        existing.profit = existing.total_revenue - existing.total_cost;
        existing.margin_percent = existing.total_cost > 0 
          ? (existing.profit / existing.total_cost) * 100 
          : 0;

        medicineMap.set(key, existing);
      });

      return Array.from(medicineMap.values())
        .sort((a, b) => b.profit - a.profit);
    },
    enabled: !!user?.id,
  });
}

export function useProfitTrendReport(dateRange: ReportDateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['report-profit-trend', user?.id, dateRange.start, dateRange.end],
    queryFn: async (): Promise<ProfitTrendData> => {
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endStr = format(dateRange.end, 'yyyy-MM-dd');

      // Calculate previous period dates
      const daysDiff = differenceInDays(dateRange.end, dateRange.start) + 1;
      const previousStart = subDays(dateRange.start, daysDiff);
      const previousEnd = subDays(dateRange.start, 1);
      const prevStartStr = format(previousStart, 'yyyy-MM-dd');
      const prevEndStr = format(previousEnd, 'yyyy-MM-dd');

      // Fetch current period sales
      const { data: currentSales } = await supabase
        .from('sales')
        .select('id, sale_date, total_amount, entry_type')
        .gte('sale_date', startStr)
        .lte('sale_date', endStr)
        .eq('entry_type', 'detailed');

      // Fetch previous period sales
      const { data: previousSales } = await supabase
        .from('sales')
        .select('id, sale_date, total_amount, entry_type')
        .gte('sale_date', prevStartStr)
        .lte('sale_date', prevEndStr)
        .eq('entry_type', 'detailed');

      // Get sale items for current period
      const currentSaleIds = currentSales?.map(s => s.id) || [];
      const previousSaleIds = previousSales?.map(s => s.id) || [];

      let currentItems: { sale_id: string; quantity: number; total_price: number; purchase_price: number }[] = [];
      let previousItems: { sale_id: string; quantity: number; total_price: number; purchase_price: number }[] = [];

      if (currentSaleIds.length > 0) {
        const { data } = await supabase
          .from('sale_items')
          .select('sale_id, quantity, total_price, purchase_price')
          .in('sale_id', currentSaleIds);
        currentItems = data || [];
      }

      if (previousSaleIds.length > 0) {
        const { data } = await supabase
          .from('sale_items')
          .select('sale_id, quantity, total_price, purchase_price')
          .in('sale_id', previousSaleIds);
        previousItems = data || [];
      }

      // Group current period by date
      const currentByDate = new Map<string, DailyProfitData>();
      currentSales?.forEach(sale => {
        const date = sale.sale_date;
        if (!currentByDate.has(date)) {
          currentByDate.set(date, { date, revenue: 0, cost: 0, profit: 0, salesCount: 0 });
        }
        const entry = currentByDate.get(date)!;
        entry.salesCount += 1;
      });

      currentItems.forEach(item => {
        const sale = currentSales?.find(s => s.id === item.sale_id);
        if (sale) {
          const entry = currentByDate.get(sale.sale_date);
          if (entry) {
            entry.revenue += Number(item.total_price);
            entry.cost += Number(item.purchase_price) * item.quantity;
          }
        }
      });

      currentByDate.forEach(entry => {
        entry.profit = entry.revenue - entry.cost;
      });

      // Group previous period by date
      const previousByDate = new Map<string, DailyProfitData>();
      previousSales?.forEach(sale => {
        const date = sale.sale_date;
        if (!previousByDate.has(date)) {
          previousByDate.set(date, { date, revenue: 0, cost: 0, profit: 0, salesCount: 0 });
        }
        const entry = previousByDate.get(date)!;
        entry.salesCount += 1;
      });

      previousItems.forEach(item => {
        const sale = previousSales?.find(s => s.id === item.sale_id);
        if (sale) {
          const entry = previousByDate.get(sale.sale_date);
          if (entry) {
            entry.revenue += Number(item.total_price);
            entry.cost += Number(item.purchase_price) * item.quantity;
          }
        }
      });

      previousByDate.forEach(entry => {
        entry.profit = entry.revenue - entry.cost;
      });

      // Sort daily data
      const dailyData = Array.from(currentByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
      const previousDailyData = Array.from(previousByDate.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Create comparison data
      const currentPeriod = dailyData.map((d, i) => ({
        dayIndex: i,
        profit: d.profit,
        date: d.date,
      }));

      const previousPeriod = previousDailyData.map((d, i) => ({
        dayIndex: i,
        profit: d.profit,
        date: d.date,
      }));

      // Calculate summary
      const currentProfit = dailyData.reduce((sum, d) => sum + d.profit, 0);
      const previousProfit = previousDailyData.reduce((sum, d) => sum + d.profit, 0);
      const changePercent = previousProfit !== 0 
        ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 
        : currentProfit > 0 ? 100 : 0;
      
      const avgDailyProfit = dailyData.length > 0 ? currentProfit / dailyData.length : 0;
      const avgPreviousDailyProfit = previousDailyData.length > 0 ? previousProfit / previousDailyData.length : 0;

      return {
        dailyData,
        comparison: {
          currentPeriod,
          previousPeriod,
        },
        summary: {
          currentProfit,
          previousProfit,
          changePercent,
          avgDailyProfit,
          avgPreviousDailyProfit,
        },
      };
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
