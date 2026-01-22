import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

// Prescription (parent record)
export interface CustomerPrescription {
  id: string;
  customer_id: string;
  user_id: string;
  doctor_name: string | null;
  prescription_date: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  medicines?: PrescriptionMedicine[];
}

// Medicine (child record under prescription)
export interface PrescriptionMedicine {
  id: string;
  prescription_id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionData {
  customer_id: string;
  doctor_name?: string;
  prescription_date?: string;
  notes?: string;
}

export interface CreateMedicineData {
  prescription_id: string;
  medicine_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  notes?: string;
}

// Hook to get all prescriptions for a customer with their medicines
export function useCustomerPrescriptions(customerId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-prescriptions', customerId],
    queryFn: async () => {
      if (!customerId) return [];

      // Get prescriptions
      const { data: prescriptions, error: prescError } = await supabase
        .from('customer_prescriptions')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_active', { ascending: false })
        .order('prescription_date', { ascending: false });

      if (prescError) throw prescError;

      // Get medicines for all prescriptions
      const prescriptionIds = prescriptions?.map(p => p.id) || [];
      
      if (prescriptionIds.length === 0) {
        return [] as CustomerPrescription[];
      }

      const { data: medicines, error: medError } = await supabase
        .from('prescription_medicines')
        .select('*')
        .in('prescription_id', prescriptionIds)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: true });

      if (medError) throw medError;

      // Combine prescriptions with their medicines
      const result = prescriptions?.map(presc => ({
        ...presc,
        medicines: medicines?.filter(m => m.prescription_id === presc.id) || [],
      })) as CustomerPrescription[];

      return result;
    },
    enabled: !!user && !!customerId,
  });
}

// Get customer IDs that have prescriptions
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
      
      const customerIds = [...new Set(data?.map(p => p.customer_id) || [])];
      return customerIds;
    },
    enabled: !!user,
  });
}

// Add a new prescription
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
          doctor_name: data.doctor_name || null,
          prescription_date: data.prescription_date || new Date().toISOString().split('T')[0],
          notes: data.notes || null,
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
        title: 'প্রেসক্রিপশন তৈরি হয়েছে',
        description: 'এখন ঔষধ যোগ করুন।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'প্রেসক্রিপশন তৈরি করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Add prescription error:', error);
    },
  });
}

// Update a prescription
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

// Delete a prescription (and all its medicines via CASCADE)
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
        description: 'প্রেসক্রিপশন মুছে ফেলা হয়েছে।',
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

// Toggle prescription status
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

// ============== Medicine Operations ==============

// Add medicine to a prescription
export function useAddPrescriptionMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customer_id, ...data }: CreateMedicineData & { customer_id: string }) => {
      const { data: medicine, error } = await supabase
        .from('prescription_medicines')
        .insert({
          prescription_id: data.prescription_id,
          medicine_name: data.medicine_name,
          dosage: data.dosage || null,
          frequency: data.frequency || null,
          duration: data.duration || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return medicine;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-prescriptions', variables.customer_id] });
      toast({
        title: 'ঔষধ যোগ হয়েছে',
        description: 'প্রেসক্রিপশনে ঔষধ যোগ করা হয়েছে।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'ঔষধ যোগ করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Add medicine error:', error);
    },
  });
}

// Update medicine
export function useUpdatePrescriptionMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      customer_id,
      ...updates
    }: Partial<CreateMedicineData> & { id: string; customer_id: string }) => {
      const { data, error } = await supabase
        .from('prescription_medicines')
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
      toast({
        title: 'আপডেট সফল',
        description: 'ঔষধ আপডেট করা হয়েছে।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'আপডেট করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Update medicine error:', error);
    },
  });
}

// Delete medicine
export function useDeletePrescriptionMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customer_id }: { id: string; customer_id: string }) => {
      const { error } = await supabase
        .from('prescription_medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-prescriptions', variables.customer_id] });
      toast({
        title: 'ডিলেট হয়েছে',
        description: 'ঔষধ মুছে ফেলা হয়েছে।',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'মুছতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Delete medicine error:', error);
    },
  });
}

// Toggle medicine status
export function useToggleMedicineStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customer_id, is_active }: { id: string; customer_id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('prescription_medicines')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-prescriptions', variables.customer_id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।',
        variant: 'destructive',
      });
      console.error('Toggle medicine status error:', error);
    },
  });
}
