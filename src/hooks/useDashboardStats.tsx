import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';

export interface DashboardStats {
  todaysSales: number;
  todaysProfit: number;
  todaysCosts: number;
  totalCustomerDues: number;
  totalSupplierDues: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  expiredItems: number;
}

export function useDashboardStats() {
  const { user } = useAuth();
  const today = new Date();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id, format(today, 'yyyy-MM-dd')],
    queryFn: async (): Promise<DashboardStats> => {
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();
      const todayDate = format(today, 'yyyy-MM-dd');
      const in30Days = format(addDays(today, 30), 'yyyy-MM-dd');
      const in60Days = format(addDays(today, 60), 'yyyy-MM-dd');
      const in90Days = format(addDays(today, 90), 'yyyy-MM-dd');

      // Fetch all data in parallel
      const [
        salesResult,
        saleItemsResult,
        costsResult,
        customerDuesResult,
        supplierDuesResult,
        batchesResult,
      ] = await Promise.all([
        // Today's sales
        supabase
          .from('sales')
          .select('total_amount')
          .eq('sale_date', todayDate),

        // Today's sale items for profit calculation
        supabase
          .from('sale_items')
          .select('total_price, purchase_price, quantity, sale_id')
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd),

        // Today's costs
        supabase
          .from('daily_costs')
          .select('amount')
          .eq('cost_date', todayDate),

        // Customer dues
        supabase
          .from('customers')
          .select('total_due')
          .eq('is_active', true)
          .gt('total_due', 0),

        // Supplier dues
        supabase
          .from('suppliers')
          .select('total_due')
          .eq('is_active', true)
          .gt('total_due', 0),

        // Medicine batches for expiry tracking
        supabase
          .from('medicine_batches')
          .select('expiry_date, quantity'),
      ]);

      // Calculate today's sales
      const todaysSales = salesResult.data?.reduce(
        (sum, s) => sum + Number(s.total_amount), 0
      ) || 0;

      // Calculate today's profit
      const todaysProfit = saleItemsResult.data?.reduce((sum, item) => {
        const revenue = Number(item.total_price);
        const cost = Number(item.purchase_price || 0) * Number(item.quantity);
        return sum + (revenue - cost);
      }, 0) || 0;

      // Calculate today's costs
      const todaysCosts = costsResult.data?.reduce(
        (sum, c) => sum + Number(c.amount), 0
      ) || 0;

      // Calculate customer dues
      const totalCustomerDues = customerDuesResult.data?.reduce(
        (sum, c) => sum + Number(c.total_due), 0
      ) || 0;

      // Calculate supplier dues
      const totalSupplierDues = supplierDuesResult.data?.reduce(
        (sum, s) => sum + Number(s.total_due), 0
      ) || 0;

      // Calculate expiry stats
      let expiringIn30Days = 0;
      let expiringIn60Days = 0;
      let expiringIn90Days = 0;
      let expiredItems = 0;

      batchesResult.data?.forEach((batch) => {
        if (!batch.expiry_date || batch.quantity <= 0) return;
        
        const expiryDate = batch.expiry_date;
        
        if (expiryDate < todayDate) {
          expiredItems++;
        } else if (expiryDate <= in30Days) {
          expiringIn30Days++;
        } else if (expiryDate <= in60Days) {
          expiringIn60Days++;
        } else if (expiryDate <= in90Days) {
          expiringIn90Days++;
        }
      });

      return {
        todaysSales,
        todaysProfit,
        todaysCosts,
        totalCustomerDues,
        totalSupplierDues,
        expiringIn30Days,
        expiringIn60Days,
        expiringIn90Days,
        expiredItems,
      };
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });
}
