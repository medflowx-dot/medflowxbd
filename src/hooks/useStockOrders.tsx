import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface StockOrder {
  id: string;
  user_id: string;
  manufacturer: string;
  manufacturer_phone: string | null;
  status: 'pending' | 'submitted' | 'received' | 'cancelled';
  notes: string | null;
  submitted_at: string | null;
  received_at: string | null;
  created_at: string;
  updated_at: string;
  items?: StockOrderItem[];
}

export interface StockOrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  medicine_name: string;
  current_stock: number;
  min_stock_level: number;
  quantity_to_order: number;
  unit: string;
  notes: string | null;
  created_at: string;
}

export interface CreateOrderData {
  manufacturer: string;
  notes?: string;
  items: Array<{
    medicine_id: string;
    medicine_name: string;
    current_stock: number;
    min_stock_level: number;
    quantity_to_order: number;
    unit: string;
    notes?: string;
  }>;
}

export function useStockOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['stock-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: orders, error: ordersError } = await supabase
        .from('stock_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { data: items, error: itemsError } = await supabase
        .from('stock_order_items')
        .select('*');

      if (itemsError) throw itemsError;

      const ordersWithItems: StockOrder[] = orders.map((order) => ({
        ...order,
        status: order.status as StockOrder['status'],
        items: items.filter((item) => item.order_id === order.id),
      }));

      return ordersWithItems;
    },
    enabled: !!user?.id,
  });

  const createOrder = useMutation({
    mutationFn: async (data: CreateOrderData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: order, error: orderError } = await supabase
        .from('stock_orders')
        .insert({
          user_id: user.id,
          manufacturer: data.manufacturer,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = data.items.map((item) => ({
        order_id: order.id,
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        current_stock: item.current_stock,
        min_stock_level: item.min_stock_level,
        quantity_to_order: item.quantity_to_order,
        unit: item.unit,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from('stock_order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-orders'] });
      toast({ title: 'Order note created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create order', description: error.message, variant: 'destructive' });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StockOrder['status'] }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      } else if (status === 'received') {
        updateData.received_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('stock_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-orders'] });
      toast({ title: 'Order status updated' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update order', description: error.message, variant: 'destructive' });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stock_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-orders'] });
      toast({ title: 'Order deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete order', description: error.message, variant: 'destructive' });
    },
  });

  const pendingOrders = ordersQuery.data?.filter((o) => o.status === 'pending') || [];
  const submittedOrders = ordersQuery.data?.filter((o) => o.status === 'submitted') || [];
  const thisWeekOrders = ordersQuery.data?.filter((o) => {
    const createdAt = new Date(o.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }) || [];

  return {
    orders: ordersQuery.data || [],
    pendingOrders,
    submittedOrders,
    thisWeekOrders,
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  };
}
