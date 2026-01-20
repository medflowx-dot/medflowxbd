import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useManufacturers } from './useManufacturers';

export interface GlobalManufacturer {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGlobalManufacturerData {
  name: string;
}

export function useGlobalManufacturers() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { createManufacturer } = useManufacturers();

  const { data: manufacturers = [], isLoading, error } = useQuery({
    queryKey: ['global-manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_manufacturers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as GlobalManufacturer[];
    },
    enabled: !!user,
  });

  const createGlobalManufacturer = useMutation({
    mutationFn: async (data: CreateGlobalManufacturerData) => {
      const { data: result, error } = await supabase
        .from('global_manufacturers')
        .insert([{ name: data.name }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-manufacturers'] });
      toast.success('Global manufacturer added');
    },
    onError: (error) => {
      toast.error('Failed to add manufacturer: ' + error.message);
    },
  });

  const updateGlobalManufacturer = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateGlobalManufacturerData>) => {
      const { data: result, error } = await supabase
        .from('global_manufacturers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-manufacturers'] });
      toast.success('Manufacturer updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const deleteGlobalManufacturer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('global_manufacturers')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-manufacturers'] });
      toast.success('Manufacturer deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const copyToLocal = useMutation({
    mutationFn: async (manufacturer: GlobalManufacturer) => {
      return createManufacturer.mutateAsync({ name: manufacturer.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Manufacturer copied to your list');
    },
    onError: (error) => {
      toast.error('Failed to copy: ' + error.message);
    },
  });

  const bulkCopyToLocal = useMutation({
    mutationFn: async (manufacturers: GlobalManufacturer[]) => {
      const results = [];
      for (const manufacturer of manufacturers) {
        try {
          await createManufacturer.mutateAsync({ name: manufacturer.name });
          results.push({ success: true, name: manufacturer.name });
        } catch (error) {
          results.push({ success: false, name: manufacturer.name });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      const successCount = results.filter(r => r.success).length;
      toast.success(`${successCount} manufacturer(s) copied to your list`);
    },
    onError: (error) => {
      toast.error('Failed to copy: ' + error.message);
    },
  });

  const bulkCreate = useMutation({
    mutationFn: async (names: string[]) => {
      const uniqueNames = [...new Set(names.map(n => n.trim()).filter(Boolean))];
      
      // Get existing manufacturers to avoid duplicates
      const { data: existing } = await supabase
        .from('global_manufacturers')
        .select('name')
        .eq('is_active', true);
      
      const existingNames = new Set((existing || []).map(m => m.name.toLowerCase()));
      const newNames = uniqueNames.filter(name => !existingNames.has(name.toLowerCase()));
      
      if (newNames.length === 0) {
        toast.info('All manufacturers already exist');
        return [];
      }
      
      const { data, error } = await supabase
        .from('global_manufacturers')
        .insert(newNames.map(name => ({ name })))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['global-manufacturers'] });
      if (data && data.length > 0) {
        toast.success(`${data.length} manufacturers imported`);
      }
    },
    onError: (error) => {
      toast.error('Failed to import: ' + error.message);
    },
  });

  return {
    manufacturers,
    isLoading,
    error,
    createGlobalManufacturer,
    updateGlobalManufacturer,
    deleteGlobalManufacturer,
    copyToLocal,
    bulkCopyToLocal,
    bulkCreate,
  };
}
