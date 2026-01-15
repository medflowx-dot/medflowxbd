import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Medicine {
  id: string;
  user_id: string;
  name: string;
  generic_name: string | null;
  category: string | null;
  manufacturer: string | null;
  manufacturer_id: string | null;
  unit: string;
  shelf_location: string | null;
  min_stock_level: number | null;
  is_tax_applicable: boolean;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineBatch {
  id: string;
  medicine_id: string;
  user_id: string;
  batch_number: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
  manufactured_date: string | null;
  supplier_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineWithBatches extends Medicine {
  batches: MedicineBatch[];
  total_stock: number;
  earliest_expiry: string | null;
}

export interface CreateMedicineData {
  name: string;
  generic_name?: string;
  category?: string;
  manufacturer?: string;
  manufacturer_id?: string;
  unit?: string;
  shelf_location?: string;
  min_stock_level?: number;
  is_tax_applicable?: boolean;
}

export interface CreateBatchData {
  medicine_id: string;
  batch_number: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  expiry_date: string;
  manufactured_date?: string;
  supplier_name?: string;
  notes?: string;
}

export function useMedicines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const medicinesQuery = useQuery({
    queryKey: ['medicines', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: medicines, error: medicinesError } = await supabase
        .from('medicines')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (medicinesError) throw medicinesError;

      const { data: batches, error: batchesError } = await supabase
        .from('medicine_batches')
        .select('*')
        .order('expiry_date');

      if (batchesError) throw batchesError;

      const medicinesWithBatches: MedicineWithBatches[] = medicines.map((medicine) => {
        const medicineBatches = batches.filter((b) => b.medicine_id === medicine.id);
        const totalStock = medicineBatches.reduce((sum, b) => sum + b.quantity, 0);
        const earliestExpiry = medicineBatches.length > 0
          ? medicineBatches.reduce((earliest, b) => 
              b.expiry_date < earliest ? b.expiry_date : earliest, 
              medicineBatches[0].expiry_date
            )
          : null;

        return {
          ...medicine,
          batches: medicineBatches,
          total_stock: totalStock,
          earliest_expiry: earliestExpiry,
        };
      });

      return medicinesWithBatches;
    },
    enabled: !!user?.id,
  });

  const createMedicine = useMutation({
    mutationFn: async (data: CreateMedicineData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: medicine, error } = await supabase
        .from('medicines')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return medicine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: 'Medicine added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add medicine', description: error.message, variant: 'destructive' });
    },
  });

  const updateMedicine = useMutation({
    mutationFn: async ({ id, ...data }: CreateMedicineData & { id: string }) => {
      const { data: medicine, error } = await supabase
        .from('medicines')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return medicine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: 'Medicine updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update medicine', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMedicine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medicines')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: 'Medicine deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete medicine', description: error.message, variant: 'destructive' });
    },
  });

  const createBatch = useMutation({
    mutationFn: async (data: CreateBatchData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: batch, error } = await supabase
        .from('medicine_batches')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: 'Batch added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add batch', description: error.message, variant: 'destructive' });
    },
  });

  const updateBatch = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateBatchData> & { id: string }) => {
      const { data: batch, error } = await supabase
        .from('medicine_batches')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: 'Batch updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update batch', description: error.message, variant: 'destructive' });
    },
  });

  const deleteBatch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medicine_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: 'Batch deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete batch', description: error.message, variant: 'destructive' });
    },
  });

  const bulkCreateMedicines = useMutation({
    mutationFn: async (medicines: CreateMedicineData[]) => {
      if (!user?.id) throw new Error('User not authenticated');

      const medicinesWithUserId = medicines.map((m) => ({
        ...m,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('medicines')
        .insert(medicinesWithUserId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: `${data.length} medicines imported successfully` });
    },
    onError: (error) => {
      toast({ title: 'Failed to import medicines', description: error.message, variant: 'destructive' });
    },
  });

  return {
    medicines: medicinesQuery.data || [],
    isLoading: medicinesQuery.isLoading,
    error: medicinesQuery.error,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    createBatch,
    updateBatch,
    deleteBatch,
    bulkCreateMedicines,
  };
}

export function useExpiryAlerts() {
  const { medicines } = useMedicines();

  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const getAllBatches = () => {
    return medicines.flatMap((m) =>
      m.batches.map((b) => ({
        ...b,
        medicine_name: m.name,
        medicine_unit: m.unit,
      }))
    );
  };

  const expired = getAllBatches().filter((b) => new Date(b.expiry_date) < today);
  const expiring30 = getAllBatches().filter((b) => {
    const expDate = new Date(b.expiry_date);
    return expDate >= today && expDate <= in30Days;
  });
  const expiring60 = getAllBatches().filter((b) => {
    const expDate = new Date(b.expiry_date);
    return expDate > in30Days && expDate <= in60Days;
  });
  const expiring90 = getAllBatches().filter((b) => {
    const expDate = new Date(b.expiry_date);
    return expDate > in60Days && expDate <= in90Days;
  });

  return {
    expired,
    expiring30,
    expiring60,
    expiring90,
    totalAlerts: expired.length + expiring30.length,
  };
}
