import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';

export interface DailyCost {
  id: string;
  user_id: string;
  cost_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpeningCash {
  id: string;
  user_id: string;
  cash_date: string;
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyCashSummary {
  openingCash: number;
  salesCashIn: number;
  dueCollected: number;
  supplierPayments: number;
  dailyCosts: number;
  closingCash: number;
  totalIn: number;
  totalOut: number;
}

export function useDailyCosts(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['daily-costs', user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_costs')
        .select('*')
        .eq('cost_date', dateStr)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DailyCost[];
    },
    enabled: !!user?.id,
  });
}

export function useOpeningCash(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['opening-cash', user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opening_cash')
        .select('*')
        .eq('cash_date', dateStr)
        .maybeSingle();

      if (error) throw error;
      return data as OpeningCash | null;
    },
    enabled: !!user?.id,
  });
}

export function useDailyCashSummary(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['daily-cash-summary', user?.id, dateStr],
    queryFn: async (): Promise<DailyCashSummary> => {
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
        openingCash,
        salesCashIn,
        dueCollected,
        supplierPayments,
        dailyCosts,
        closingCash,
        totalIn,
        totalOut,
      };
    },
    enabled: !!user?.id,
  });
}

// Hook to get the previous day's closing cash to suggest as opening cash
export function usePreviousDayClosingCash(date: Date) {
  const previousDay = subDays(date, 1);
  const { data: previousDaySummary, isLoading } = useDailyCashSummary(previousDay);
  
  return {
    previousDayClosingCash: previousDaySummary?.closingCash ?? null,
    previousDate: previousDay,
    isLoading,
  };
}

export function useAddDailyCost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cost: {
      cost_date: string;
      category: string;
      description: string;
      amount: number;
      payment_method: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_costs')
        .insert({
          ...cost,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-costs'] });
      queryClient.invalidateQueries({ queryKey: ['daily-cash-summary'] });
      toast.success('Cost added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add cost: ' + error.message);
    },
  });
}

export function useDeleteDailyCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (costId: string) => {
      const { error } = await supabase
        .from('daily_costs')
        .delete()
        .eq('id', costId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-costs'] });
      queryClient.invalidateQueries({ queryKey: ['daily-cash-summary'] });
      toast.success('Cost deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete cost: ' + error.message);
    },
  });
}

export function useSetOpeningCash() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, amount, notes }: { date: string; amount: number; notes?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Upsert opening cash
      const { data, error } = await supabase
        .from('opening_cash')
        .upsert({
          user_id: user.id,
          cash_date: date,
          amount,
          notes,
        }, {
          onConflict: 'user_id,cash_date',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opening-cash'] });
      queryClient.invalidateQueries({ queryKey: ['daily-cash-summary'] });
      toast.success('Opening cash updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update opening cash: ' + error.message);
    },
  });
}

export function useDailySales(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['daily-sales', user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*, customers(name)')
        .eq('sale_date', dateStr)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useDailyCustomerPayments(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['daily-customer-payments', user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_payments')
        .select('*, customers(name)')
        .eq('payment_date', dateStr)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useDailySupplierPayments(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['daily-supplier-payments', user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_payments')
        .select('*, suppliers(name)')
        .eq('payment_date', dateStr)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}
