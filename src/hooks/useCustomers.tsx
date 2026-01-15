import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  total_due: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export function useCustomers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!user?.id,
  });

  const createCustomer = useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Customer added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add customer', description: error.message, variant: 'destructive' });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...data }: CreateCustomerData & { id: string }) => {
      const { data: customer, error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Customer updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update customer', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Customer deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete customer', description: error.message, variant: 'destructive' });
    },
  });

  const customersWithDue = (customersQuery.data || []).filter((c) => c.total_due > 0);

  return {
    customers: customersQuery.data || [],
    customersWithDue,
    isLoading: customersQuery.isLoading,
    error: customersQuery.error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
