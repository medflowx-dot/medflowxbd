import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export interface SaleItem {
  id: string;
  sale_id: string;
  medicine_id: string | null;
  batch_id: string | null;
  medicine_name: string;
  batch_number: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  customer_id: string | null;
  invoice_number: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  items?: SaleItem[];
}

export interface CustomerPayment {
  id: string;
  user_id: string;
  customer_id: string;
  sale_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

export interface CreateSaleItemData {
  medicine_id?: string;
  batch_id?: string;
  medicine_name: string;
  batch_number?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateSaleData {
  customer_id?: string;
  sale_date?: string;
  subtotal: number;
  discount?: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method?: string;
  notes?: string;
  items: CreateSaleItemData[];
}

export function useSales(dateFilter?: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ['sales', user?.id, dateFilter?.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('sales')
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .order('created_at', { ascending: false });

      if (dateFilter) {
        const dateStr = format(dateFilter, 'yyyy-MM-dd');
        query = query.eq('sale_date', dateStr);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Sale[];
    },
    enabled: !!user?.id,
  });

  const createSale = useMutation({
    mutationFn: async (data: CreateSaleData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Generate invoice number
      const { data: invoiceData, error: invoiceError } = await supabase
        .rpc('generate_invoice_number');

      if (invoiceError) throw invoiceError;

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          customer_id: data.customer_id || null,
          invoice_number: invoiceData,
          sale_date: data.sale_date || format(new Date(), 'yyyy-MM-dd'),
          subtotal: data.subtotal,
          discount: data.discount || 0,
          total_amount: data.total_amount,
          paid_amount: data.paid_amount,
          due_amount: data.due_amount,
          payment_method: data.payment_method || 'cash',
          notes: data.notes || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      if (data.items.length > 0) {
        const saleItems = data.items.map((item) => ({
          sale_id: sale.id,
          medicine_id: item.medicine_id || null,
          batch_id: item.batch_id || null,
          medicine_name: item.medicine_name,
          batch_number: item.batch_number || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) throw itemsError;

        // Update batch quantities - decrement stock
        for (const item of data.items) {
          if (item.batch_id) {
            // First get current quantity
            const { data: batchData } = await supabase
              .from('medicine_batches')
              .select('quantity')
              .eq('id', item.batch_id)
              .single();

            if (batchData) {
              await supabase
                .from('medicine_batches')
                .update({ quantity: Math.max(0, batchData.quantity - item.quantity) })
                .eq('id', item.batch_id);
            }
          }
        }
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: 'Sale recorded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to record sale', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Sale deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete sale', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate daily stats
  const todaySales = (salesQuery.data || []).filter(
    (s) => s.sale_date === format(new Date(), 'yyyy-MM-dd')
  );
  const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const todayCash = todaySales.reduce((sum, s) => sum + Number(s.paid_amount), 0);
  const todayDue = todaySales.reduce((sum, s) => sum + Number(s.due_amount), 0);

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    error: salesQuery.error,
    createSale,
    deleteSale,
    todayStats: {
      total: todayTotal,
      cash: todayCash,
      due: todayDue,
      count: todaySales.length,
    },
  };
}

export function useCustomerPayments(customerId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['customer-payments', user?.id, customerId],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('customer_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CustomerPayment[];
    },
    enabled: !!user?.id,
  });

  const createPayment = useMutation({
    mutationFn: async (data: {
      customer_id: string;
      sale_id?: string;
      amount: number;
      payment_date?: string;
      payment_method?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: payment, error } = await supabase
        .from('customer_payments')
        .insert({
          user_id: user.id,
          customer_id: data.customer_id,
          sale_id: data.sale_id || null,
          amount: data.amount,
          payment_date: data.payment_date || format(new Date(), 'yyyy-MM-dd'),
          payment_method: data.payment_method || 'cash',
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({ title: 'Payment recorded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to record payment', description: error.message, variant: 'destructive' });
    },
  });

  return {
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    createPayment,
  };
}
