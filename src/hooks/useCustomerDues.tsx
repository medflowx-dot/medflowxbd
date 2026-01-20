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

export interface CustomerWithPayments extends Customer {
  payments: CustomerPayment[];
}

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

      return {
        ...customer,
        payments: payments || [],
      } as CustomerWithPayments;
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
      // Update customer's total due
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('total_due')
        .eq('id', data.customer_id)
        .single();

      if (fetchError) throw fetchError;

      const newTotalDue = Number(customer.total_due) + data.amount;

      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          total_due: newTotalDue,
          notes: data.notes ? `${customer.total_due > 0 ? 'Added due: ' : ''}${data.notes}` : undefined,
        })
        .eq('id', data.customer_id);

      if (updateError) throw updateError;

      return { customer_id: data.customer_id, newTotalDue };
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

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', customerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues-summary'] });
      toast({
        title: 'Customer removed',
        description: 'Customer has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove customer.',
        variant: 'destructive',
      });
      console.error('Delete customer error:', error);
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
