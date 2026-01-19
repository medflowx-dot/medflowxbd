import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useMedicines } from './useMedicines';

export interface GlobalMedicine {
  id: string;
  name: string;
  generic_name: string | null;
  category: string | null;
  manufacturer_id: string | null;
  unit: string;
  is_tax_applicable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  manufacturer?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateGlobalMedicineData {
  name: string;
  generic_name?: string;
  category?: string;
  manufacturer_id?: string;
  unit?: string;
  is_tax_applicable?: boolean;
}

export function useGlobalMedicines() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { createMedicine } = useMedicines();

  const { data: medicines = [], isLoading, error } = useQuery({
    queryKey: ['global-medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_medicines')
        .select(`
          *,
          manufacturer:global_manufacturers(id, name)
        `)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as GlobalMedicine[];
    },
    enabled: !!user,
  });

  const createGlobalMedicine = useMutation({
    mutationFn: async (data: CreateGlobalMedicineData) => {
      const { data: result, error } = await supabase
        .from('global_medicines')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-medicines'] });
      toast.success('Global medicine added');
    },
    onError: (error) => {
      toast.error('Failed to add medicine: ' + error.message);
    },
  });

  const updateGlobalMedicine = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateGlobalMedicineData>) => {
      const { data: result, error } = await supabase
        .from('global_medicines')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-medicines'] });
      toast.success('Medicine updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const deleteGlobalMedicine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('global_medicines')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-medicines'] });
      toast.success('Medicine deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const copyToLocal = useMutation({
    mutationFn: async (medicine: GlobalMedicine) => {
      return createMedicine.mutateAsync({
        name: medicine.name,
        generic_name: medicine.generic_name || undefined,
        category: medicine.category || undefined,
        unit: medicine.unit,
        is_tax_applicable: medicine.is_tax_applicable,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast.success('Medicine copied to your inventory');
    },
    onError: (error) => {
      toast.error('Failed to copy: ' + error.message);
    },
  });

  const bulkCreate = useMutation({
    mutationFn: async (medicines: CreateGlobalMedicineData[]) => {
      const { data, error } = await supabase
        .from('global_medicines')
        .insert(medicines)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['global-medicines'] });
      toast.success(`${data?.length || 0} medicines imported`);
    },
    onError: (error) => {
      toast.error('Failed to import: ' + error.message);
    },
  });

  return {
    medicines,
    isLoading,
    error,
    createGlobalMedicine,
    updateGlobalMedicine,
    deleteGlobalMedicine,
    copyToLocal,
    bulkCreate,
  };
}
