import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  contact_person: string | null;
  notes: string | null;
  total_due: number;
  total_paid: number;
  is_active: boolean | null;
  manufacturer_id: string | null;
  created_at: string;
  updated_at: string;
  manufacturer?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface SupplierPayment {
  id: string;
  user_id: string;
  supplier_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  supplier?: Supplier;
}

export interface SupplierPurchase {
  id: string;
  user_id: string;
  supplier_id: string;
  invoice_number: string | null;
  purchase_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export function useSupplierDuesSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['supplier-dues-summary', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, phone, total_due')
        .eq('is_active', true)
        .gt('total_due', 0)
        .order('total_due', { ascending: false });

      if (error) throw error;
      
      const totalDue = data?.reduce((sum, s) => sum + Number(s.total_due), 0) || 0;
      const suppliersWithDue = data?.length || 0;

      return {
        suppliers: data || [],
        totalDue,
        suppliersWithDue,
      };
    },
    enabled: !!user,
  });
}

export function useSuppliers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery({
    queryKey: ['suppliers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          manufacturer:manufacturers(id, name, phone)
        `)
        .order('name');
      
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!user,
  });

  const paymentsQuery = useQuery({
    queryKey: ['supplier-payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_payments')
        .select('*, supplier:suppliers(*)')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data as SupplierPayment[];
    },
    enabled: !!user,
  });

  const purchasesQuery = useQuery({
    queryKey: ['supplier-purchases', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_purchases')
        .select('*, supplier:suppliers(*)')
        .order('purchase_date', { ascending: false });
      
      if (error) throw error;
      return data as SupplierPurchase[];
    },
    enabled: !!user,
  });

  const addSupplierMutation = useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'user_id' | 'total_due' | 'total_paid' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplier,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add supplier: ' + error.message);
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update supplier: ' + error.message);
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete supplier: ' + error.message);
    },
  });

  const addPurchaseMutation = useMutation({
    mutationFn: async (purchase: Omit<SupplierPurchase, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'supplier'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('supplier_purchases')
        .insert({
          ...purchase,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Purchase recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record purchase: ' + error.message);
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (payment: Omit<SupplierPayment, 'id' | 'user_id' | 'created_at' | 'supplier'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('supplier_payments')
        .insert({
          ...payment,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record payment: ' + error.message);
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('supplier_payments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete payment: ' + error.message);
    },
  });

  return {
    suppliers: suppliersQuery.data ?? [],
    payments: paymentsQuery.data ?? [],
    purchases: purchasesQuery.data ?? [],
    isLoading: suppliersQuery.isLoading || paymentsQuery.isLoading || purchasesQuery.isLoading,
    addSupplier: addSupplierMutation.mutateAsync,
    updateSupplier: updateSupplierMutation.mutateAsync,
    deleteSupplier: deleteSupplierMutation.mutateAsync,
    addPurchase: addPurchaseMutation.mutateAsync,
    addPayment: addPaymentMutation.mutateAsync,
    deletePayment: deletePaymentMutation.mutateAsync,
  };
}
