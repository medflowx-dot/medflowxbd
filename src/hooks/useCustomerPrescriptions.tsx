import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface CustomerPrescription {
  id: string;
  customer_id: string;
  user_id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  notes: string | null;
  start_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionData {
  customer_id: string;
  medicine_name: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
  start_date?: string;
}

export function useCustomerPrescriptions(customerId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-prescriptions', customerId],
    queryFn: async () => {
      if (!customerId) return [];

      const { data, error } = await supabase
        .from('customer_prescriptions')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomerPrescription[];
    },
    enabled: !!user && !!customerId,
  });
}

export function useCustomersWithPrescriptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customers-with-prescriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_prescriptions')
        .select('customer_id')
        .eq('is_active', true);

      if (error) throw error;
      
      // Get unique customer IDs
      const customerIds = [...new Set(data?.map(p => p.customer_id) || [])];
      return customerIds;
    },
    enabled: !!user,
  });
}

export function useAddPrescription() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreatePrescriptionData) => {
      const { data: prescription, error } = await supabase
        .from('customer_prescriptions')
        .insert({
          user_id: user!.id,
          customer_id: data.customer_id,
          medicine_name: data.medicine_name,
          dosage: data.dosage || null,
          frequency: data.frequency || null,
          notes: data.notes || null,
          start_date: data.start_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return prescription;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-prescriptions', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-prescriptions'] });
      toast({
        title: 'প্রেসক্রিপশন যোগ হয়েছে',
        description: 'ঔষধ সফলভাবে যোগ করা হয়েছে।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'প্রেসক্রিপশন যোগ করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Add prescription error:', error);
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      customer_id,
      ...updates
    }: Partial<CreatePrescriptionData> & { id: string; customer_id: string }) => {
      const { data, error } = await supabase
        .from('customer_prescriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-prescriptions', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-prescriptions'] });
      toast({
        title: 'আপডেট সফল',
        description: 'প্রেসক্রিপশন আপডেট করা হয়েছে।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'আপডেট করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Update prescription error:', error);
    },
  });
}

export function useTogglePrescriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customer_id, is_active }: { id: string; customer_id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('customer_prescriptions')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-prescriptions', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-prescriptions'] });
      toast({
        title: variables.is_active ? 'সক্রিয় করা হয়েছে' : 'নিষ্ক্রিয় করা হয়েছে',
        description: variables.is_active ? 'ঔষধ আবার সক্রিয় করা হয়েছে।' : 'ঔষধ নিষ্ক্রিয় করা হয়েছে।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Toggle prescription status error:', error);
    },
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customer_id }: { id: string; customer_id: string }) => {
      const { error } = await supabase
        .from('customer_prescriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-prescriptions', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customers-with-prescriptions'] });
      toast({
        title: 'ডিলেট হয়েছে',
        description: 'প্রেসক্রিপশন থেকে ঔষধ মুছে ফেলা হয়েছে।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'মুছতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Delete prescription error:', error);
    },
  });
}
