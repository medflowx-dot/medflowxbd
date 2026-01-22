import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { bn } from 'date-fns/locale';

export interface DailySalesData {
  date: string;
  day: string;
  dayShort: string;
  amount: number;
}

export interface SalesTrendData {
  dailyData: DailySalesData[];
  thisWeekTotal: number;
  lastWeekTotal: number;
  percentChange: number;
  isPositive: boolean;
}

export function useSalesTrend() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sales-trend', user?.id],
    queryFn: async (): Promise<SalesTrendData> => {
      if (!user?.id) {
        return {
          dailyData: [],
          thisWeekTotal: 0,
          lastWeekTotal: 0,
          percentChange: 0,
          isPositive: true,
        };
      }

      const today = new Date();
      const startOfThisWeek = subDays(today, 6); // Last 7 days including today
      const startOfLastWeek = subDays(today, 13); // Previous 7 days

      // Fetch last 14 days of sales
      const { data: salesData, error } = await supabase
        .from('sales')
        .select('sale_date, total_amount')
        .eq('user_id', user.id)
        .gte('sale_date', format(startOfLastWeek, 'yyyy-MM-dd'))
        .lte('sale_date', format(today, 'yyyy-MM-dd'));

      if (error) throw error;

      // Group sales by date
      const salesByDate: Record<string, number> = {};
      salesData?.forEach(sale => {
        const date = sale.sale_date;
        salesByDate[date] = (salesByDate[date] || 0) + Number(sale.total_amount);
      });

      // Generate daily data for last 7 days
      const dailyData: DailySalesData[] = [];
      let thisWeekTotal = 0;
      let lastWeekTotal = 0;

      // This week (last 7 days)
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const amount = salesByDate[dateStr] || 0;
        thisWeekTotal += amount;

        dailyData.push({
          date: dateStr,
          day: format(date, 'EEEE', { locale: bn }),
          dayShort: format(date, 'EEE', { locale: bn }),
          amount,
        });
      }

      // Last week (7-13 days ago)
      for (let i = 13; i >= 7; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        lastWeekTotal += salesByDate[dateStr] || 0;
      }

      // Calculate percent change
      let percentChange = 0;
      if (lastWeekTotal > 0) {
        percentChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      } else if (thisWeekTotal > 0) {
        percentChange = 100;
      }

      return {
        dailyData,
        thisWeekTotal,
        lastWeekTotal,
        percentChange: Math.round(percentChange * 10) / 10,
        isPositive: percentChange >= 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes - trend data doesn't need frequent updates
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes (was 1 min)
  });
}
