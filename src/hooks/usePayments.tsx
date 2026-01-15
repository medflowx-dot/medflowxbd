import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  gateway_response: Json | null;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAllPayments() {
  return useQuery({
    queryKey: ['all-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            pharmacy_name
          ),
          subscriptions:subscription_id (
            plan_type,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useUserPayments(userId?: string) {
  return useQuery({
    queryKey: ['user-payments', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!userId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: {
      user_id: string;
      subscription_id?: string | null;
      amount: number;
      currency?: string;
      status?: string;
      payment_method?: string | null;
      transaction_id?: string | null;
      gateway_response?: Json | null;
      notes?: string | null;
      paid_at?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-payments'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record payment: ' + error.message);
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      paymentId, 
      status, 
      notes 
    }: { 
      paymentId: string; 
      status: 'completed' | 'failed' | 'refunded';
      notes?: string;
    }) => {
      const updates: {
        status: string;
        paid_at?: string;
        notes?: string;
      } = { 
        status,
      };
      
      if (status === 'completed') {
        updates.paid_at = new Date().toISOString();
      }
      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-payments'] });
      toast.success('Payment status updated');
    },
    onError: (error) => {
      toast.error('Failed to update payment: ' + error.message);
    },
  });
}

// Payment stats calculation
export function usePaymentStats() {
  const { data: payments, isLoading } = useAllPayments();

  const stats = {
    totalRevenue: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
    pendingAmount: 0,
  };

  if (payments) {
    payments.forEach((payment) => {
      if (payment.status === 'completed') {
        stats.totalRevenue += Number(payment.amount);
        stats.completedCount++;
      } else if (payment.status === 'pending') {
        stats.pendingCount++;
        stats.pendingAmount += Number(payment.amount);
      } else if (payment.status === 'failed') {
        stats.failedCount++;
      } else if (payment.status === 'refunded') {
        stats.refundedCount++;
      }
    });
  }

  return { stats, isLoading };
}
