import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Manufacturer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contact_person: string | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CreateManufacturerData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_person?: string;
  notes?: string;
}

export function useManufacturers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const manufacturersQuery = useQuery({
    queryKey: ['manufacturers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Manufacturer[];
    },
    enabled: !!user?.id,
  });

  const createManufacturer = useMutation({
    mutationFn: async (data: CreateManufacturerData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: manufacturer, error } = await supabase
        .from('manufacturers')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return manufacturer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast({ title: 'Manufacturer added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add manufacturer', description: error.message, variant: 'destructive' });
    },
  });

  const updateManufacturer = useMutation({
    mutationFn: async ({ id, ...data }: CreateManufacturerData & { id: string }) => {
      const { data: manufacturer, error } = await supabase
        .from('manufacturers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return manufacturer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast({ title: 'Manufacturer updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update manufacturer', description: error.message, variant: 'destructive' });
    },
  });

  const deleteManufacturer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manufacturers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast({ title: 'Manufacturer deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete manufacturer', description: error.message, variant: 'destructive' });
    },
  });

  const getManufacturerByName = (name: string) => {
    return manufacturersQuery.data?.find(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );
  };

  return {
    manufacturers: manufacturersQuery.data || [],
    isLoading: manufacturersQuery.isLoading,
    error: manufacturersQuery.error,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
    getManufacturerByName,
  };
}
