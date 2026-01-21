import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  total_due: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayment {
  id: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface CustomerDue {
  id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  notes: string | null;
  created_at: string;
}

export interface CustomerWithHistory extends Customer {
  payments: CustomerPayment[];
  dues: CustomerDue[];
}

// Backwards compatibility alias
export type CustomerWithPayments = CustomerWithHistory;

export function useCustomers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!user,
  });
}

export function useCustomerWithPayments(customerId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-payments', customerId],
    queryFn: async () => {
      if (!customerId) return null;

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;

      const { data: payments, error: paymentsError } = await supabase
        .from('customer_payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch dues from the new customer_dues table
      const { data: dues, error: duesError } = await supabase
        .from('customer_dues')
        .select('*')
        .eq('customer_id', customerId)
        .order('due_date', { ascending: false });

      if (duesError) throw duesError;

      return {
        ...customer,
        payments: payments || [],
        dues: dues || [],
      } as CustomerWithHistory;
    },
    enabled: !!user && !!customerId,
  });
}

export function useCustomerDuesSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-dues-summary', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, total_due')
        .eq('is_active', true)
        .gt('total_due', 0)
        .order('total_due', { ascending: false });

      if (error) throw error;
      
      const totalDue = data?.reduce((sum, c) => sum + Number(c.total_due), 0) || 0;
      const customersWithDue = data?.length || 0;

      return {
        customers: data || [],
        totalDue,
        customersWithDue,
      };
    },
    enabled: !!user,
  });
}

export function useAddCustomer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (customer: {
      name: string;
      phone?: string;
      address?: string;
      notes?: string;
      initial_due?: number;
    }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          user_id: user!.id,
          name: customer.name,
          phone: customer.phone || null,
          address: customer.address || null,
          notes: customer.notes || null,
          total_due: customer.initial_due || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      toast({
        title: 'Customer added',
        description: 'Customer has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add customer. Please try again.',
        variant: 'destructive',
      });
      console.error('Add customer error:', error);
    },
  });
}

export function useAddCustomerDue() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      customer_id: string;
      amount: number;
      notes?: string;
    }) => {
      // Insert into customer_dues table - trigger will auto-update total_due
      const { data: due, error } = await supabase
        .from('customer_dues')
        .insert({
          user_id: user!.id,
          customer_id: data.customer_id,
          amount: data.amount,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return due;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      toast({
        title: 'Due added',
        description: 'Customer due has been recorded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add due. Please try again.',
        variant: 'destructive',
      });
      console.error('Add due error:', error);
    },
  });
}

export function useUpdateCustomerDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amount,
      notes,
    }: {
      id: string;
      amount: number;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('customer_dues')
        .update({
          amount,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      toast({
        title: 'Due updated',
        description: 'Due entry has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update due.',
        variant: 'destructive',
      });
      console.error('Update due error:', error);
    },
  });
}

export function useDeleteCustomerDue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dueId: string) => {
      const { error } = await supabase
        .from('customer_dues')
        .delete()
        .eq('id', dueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      toast({
        title: 'Due deleted',
        description: 'Due entry has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete due.',
        variant: 'destructive',
      });
      console.error('Delete due error:', error);
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payment: {
      customer_id: string;
      amount: number;
      payment_method?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('customer_payments')
        .insert({
          user_id: user!.id,
          customer_id: payment.customer_id,
          amount: payment.amount,
          payment_method: payment.payment_method || 'cash',
          notes: payment.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      toast({
        title: 'Payment recorded',
        description: 'Payment has been recorded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
      console.error('Record payment error:', error);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      phone?: string;
      address?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      toast({
        title: 'Customer updated',
        description: 'Customer information has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update customer.',
        variant: 'destructive',
      });
      console.error('Update customer error:', error);
    },
  });
}

// Check if customer has related data before deletion
export async function checkCustomerHasData(customerId: string): Promise<{ hasData: boolean; paymentsCount: number; duesCount: number }> {
  const [paymentsRes, duesRes] = await Promise.all([
    supabase.from('customer_payments').select('id', { count: 'exact', head: true }).eq('customer_id', customerId),
    supabase.from('customer_dues').select('id', { count: 'exact', head: true }).eq('customer_id', customerId),
  ]);

  const paymentsCount = paymentsRes.count || 0;
  const duesCount = duesRes.count || 0;

  return {
    hasData: paymentsCount > 0 || duesCount > 0,
    paymentsCount,
    duesCount,
  };
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      // Check if customer has any related data
      const { hasData, paymentsCount, duesCount } = await checkCustomerHasData(customerId);

      if (hasData) {
        const details: string[] = [];
        if (duesCount > 0) details.push(`${duesCount}টি বকেয়া এন্ট্রি`);
        if (paymentsCount > 0) details.push(`${paymentsCount}টি পেমেন্ট`);
        
        throw new Error(`এই কাস্টমারের ${details.join(' এবং ')} রয়েছে। প্রথমে সব লেনদেন ডেটা মুছে ফেলুন।`);
      }

      // Safe to delete - no related data
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      toast({
        title: 'কাস্টমার ডিলেট হয়েছে',
        description: 'কাস্টমার সফলভাবে মুছে ফেলা হয়েছে।',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'ডিলেট করা যাচ্ছে না',
        description: error.message || 'কাস্টমার মুছতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Delete customer error:', error);
    },
  });
}

export function useUpdateCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amount,
      payment_method,
      payment_date,
      notes,
    }: {
      id: string;
      amount: number;
      payment_method: string;
      payment_date: string;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('customer_payments')
        .update({
          amount,
          payment_method,
          payment_date,
          notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      toast({
        title: 'Payment updated',
        description: 'Payment record has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update payment.',
        variant: 'destructive',
      });
      console.error('Update payment error:', error);
    },
  });
}

export function useDeleteCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('customer_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      toast({
        title: 'Payment deleted',
        description: 'Payment record has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete payment.',
        variant: 'destructive',
      });
      console.error('Delete payment error:', error);
    },
  });
}

// Clear all customer history (payments and dues)
export function useClearCustomerHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      // Delete all payments first
      const { error: paymentsError } = await supabase
        .from('customer_payments')
        .delete()
        .eq('customer_id', customerId);

      if (paymentsError) throw paymentsError;

      // Delete all dues
      const { error: duesError } = await supabase
        .from('customer_dues')
        .delete()
        .eq('customer_id', customerId);

      if (duesError) throw duesError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues'] });
      queryClient.invalidateQueries({ queryKey: ['customer-with-payments'] });
      toast({
        title: 'সব হিস্ট্রি মুছে ফেলা হয়েছে',
        description: 'কাস্টমারের সকল বকেয়া ও পেমেন্ট হিস্ট্রি স্থায়ীভাবে মুছে ফেলা হয়েছে।',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear history.',
        variant: 'destructive',
      });
    },
  });
}

export function generateWhatsAppMessage(customer: { name: string; phone?: string | null; total_due: number }) {
  const message = `*Due Payment Reminder*

Dear ${customer.name},

This is a friendly reminder that you have an outstanding balance of *৳${customer.total_due.toFixed(2)}* with us.

Please clear your dues at your earliest convenience.

Thank you for your business!

_MedFlowx - Pharmacy Management_`;

  return message;
}

export function shareViaWhatsApp(customer: { name: string; phone?: string | null; total_due: number }) {
  const message = generateWhatsAppMessage(customer);
  const encodedMessage = encodeURIComponent(message);
  const phone = customer.phone?.replace(/[^0-9]/g, '') || '';
  
  // Use WhatsApp Web/App URL scheme
  const url = phone 
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
  
  window.open(url, '_blank');
}
