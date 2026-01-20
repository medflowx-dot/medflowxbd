import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface PaymentRequest {
  id: string;
  user_id: string;
  plan_id: string | null;
  plan_type: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  phone_number: string | null;
  status: string;
  rejection_reason: string | null;
  verified_by: string | null;
  submitted_at: string;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRequestWithUser extends PaymentRequest {
  profiles?: {
    full_name: string | null;
    pharmacy_name: string | null;
    phone: string | null;
  };
}

// Hook for users to view their own payment requests
export function useUserPaymentRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-payment-requests', user?.id],
    queryFn: async (): Promise<PaymentRequest[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment requests:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });
}

// Hook for owner admin to view all payment requests
export function useAllPaymentRequests(status?: string) {
  return useQuery({
    queryKey: ['all-payment-requests', status],
    queryFn: async (): Promise<PaymentRequestWithUser[]> => {
      let query = supabase
        .from('payment_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all payment requests:', error);
        throw error;
      }

      // Fetch profiles separately for each request
      const requestsWithProfiles: PaymentRequestWithUser[] = await Promise.all(
        (data || []).map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, pharmacy_name, phone')
            .eq('user_id', req.user_id)
            .maybeSingle();
          
          return {
            ...req,
            profiles: profile || undefined,
          };
        })
      );

      return requestsWithProfiles;
    },
  });
}

// Hook to create a new payment request
export function useCreatePaymentRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: {
      plan_id?: string;
      plan_type: string;
      amount: number;
      payment_method: string;
      transaction_id: string;
      phone_number?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          plan_id: request.plan_id || null,
          plan_type: request.plan_type,
          amount: request.amount,
          payment_method: request.payment_method,
          transaction_id: request.transaction_id,
          phone_number: request.phone_number || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-payment-requests'] });
      toast({
        title: 'সফল!',
        description: 'পেমেন্ট রিকোয়েস্ট সাবমিট হয়েছে। ভেরিফিকেশনের জন্য অপেক্ষা করুন।',
      });
    },
    onError: (error) => {
      console.error('Error creating payment request:', error);
      toast({
        title: 'ত্রুটি',
        description: 'পেমেন্ট রিকোয়েস্ট সাবমিট করা যায়নি।',
        variant: 'destructive',
      });
    },
  });
}

// Hook for owner to verify/reject payment requests
export function useVerifyPaymentRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      requestId,
      action,
      rejectionReason,
    }: {
      requestId: string;
      action: 'verify' | 'reject';
      rejectionReason?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update payment request status
      const { data: request, error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: action === 'verify' ? 'verified' : 'rejected',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          rejection_reason: action === 'reject' ? rejectionReason : null,
        })
        .eq('id', requestId)
        .select()
        .single();

      if (updateError) throw updateError;

      // If verified, update or create subscription
      if (action === 'verify' && request) {
        const planType = request.plan_type;
        let currentPeriodEnd: string | null = null;
        let trialEndsAt: string | null = null;
        let lifetimeServiceDueDate: string | null = null;

        const now = new Date();
        
        if (planType === 'monthly') {
          currentPeriodEnd = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
        } else if (planType === 'yearly') {
          currentPeriodEnd = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
        } else if (planType === 'lifetime') {
          // Lifetime has yearly service charge
          lifetimeServiceDueDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
        }

        // Check if user has existing subscription
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', request.user_id)
          .maybeSingle();

        if (existingSub) {
          // Update existing subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .update({
              plan_type: planType,
              status: 'active',
              amount: request.amount,
              current_period_start: new Date().toISOString(),
              current_period_end: currentPeriodEnd,
              trial_ends_at: null,
              lifetime_service_due_date: lifetimeServiceDueDate,
              payment_method: request.payment_method,
            })
            .eq('user_id', request.user_id);

          if (subError) throw subError;
        } else {
          // Create new subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: request.user_id,
              plan_type: planType,
              status: 'active',
              amount: request.amount,
              current_period_start: new Date().toISOString(),
              current_period_end: currentPeriodEnd,
              lifetime_service_due_date: lifetimeServiceDueDate,
              payment_method: request.payment_method,
            });

          if (subError) throw subError;
        }
      }

      return request;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-payment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: variables.action === 'verify' ? 'অনুমোদিত!' : 'প্রত্যাখ্যাত',
        description: variables.action === 'verify' 
          ? 'পেমেন্ট ভেরিফাই এবং সাবস্ক্রিপশন সক্রিয় করা হয়েছে।'
          : 'পেমেন্ট রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে।',
      });
    },
    onError: (error) => {
      console.error('Error verifying payment request:', error);
      toast({
        title: 'ত্রুটি',
        description: 'অপারেশন সম্পন্ন করা যায়নি।',
        variant: 'destructive',
      });
    },
  });
}
