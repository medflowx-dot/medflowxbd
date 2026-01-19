import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface StockShortNote {
  id: string;
  user_id: string;
  note_date: string;
  remarks: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  items?: StockShortItem[];
}

export interface StockShortItem {
  id: string;
  note_id: string;
  manufacturer_id: string;
  medicine_id: string;
  quantity: number;
  is_tax_applicable: boolean;
  created_at: string;
  medicine?: {
    id: string;
    name: string;
    unit: string;
    manufacturer_id: string | null;
  };
  manufacturer?: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface SupplierOrder {
  id: string;
  user_id: string;
  supplier_id: string;
  note_id: string | null;
  order_number: string;
  status: string;
  order_date: string;
  ordered_at: string | null;
  received_at: string | null;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp_number: string | null;
    manufacturer_id: string | null;
  };
  items?: SupplierOrderItem[];
}

export interface SupplierOrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  is_tax_applicable: boolean;
  unit: string;
  created_at: string;
}

export function useStockShortList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch stock short notes
  const notesQuery = useQuery({
    queryKey: ['stock-short-notes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_short_notes')
        .select(`
          *,
          items:stock_short_items(
            *,
            medicine:medicines(id, name, unit, manufacturer_id),
            manufacturer:manufacturers(id, name, phone)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StockShortNote[];
    },
    enabled: !!user,
  });

  // Fetch supplier orders
  const ordersQuery = useQuery({
    queryKey: ['supplier-orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_orders')
        .select(`
          *,
          supplier:suppliers(id, name, phone, whatsapp_number, manufacturer_id),
          items:supplier_order_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SupplierOrder[];
    },
    enabled: !!user,
  });

  // Create stock short note
  const createNoteMutation = useMutation({
    mutationFn: async (data: { note_date: string; remarks?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: note, error } = await supabase
        .from('stock_short_notes')
        .insert({
          user_id: user.id,
          note_date: data.note_date,
          remarks: data.remarks || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-short-notes'] });
      toast.success('Stock short note created');
    },
    onError: (error) => {
      toast.error('Failed to create note: ' + error.message);
    },
  });

  // Add item to note
  const addItemMutation = useMutation({
    mutationFn: async (data: {
      note_id: string;
      manufacturer_id: string;
      medicine_id: string;
      quantity: number;
    }) => {
      const { data: item, error } = await supabase
        .from('stock_short_items')
        .insert({
          ...data,
          is_tax_applicable: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-short-notes'] });
      toast.success('Item added to note');
    },
    onError: (error) => {
      toast.error('Failed to add item: ' + error.message);
    },
  });

  // Delete item from note
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('stock_short_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-short-notes'] });
      toast.success('Item removed');
    },
    onError: (error) => {
      toast.error('Failed to remove item: ' + error.message);
    },
  });

  // Complete note and create orders
  const completeNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get note with items
      const { data: note, error: noteError } = await supabase
        .from('stock_short_notes')
        .select(`
          *,
          items:stock_short_items(
            *,
            medicine:medicines(id, name, unit, manufacturer_id)
          )
        `)
        .eq('id', noteId)
        .single();
      
      if (noteError) throw noteError;
      if (!note.items || note.items.length === 0) {
        throw new Error('Note has no items');
      }

      // Group items by manufacturer
      const itemsByManufacturer = note.items.reduce((acc: Record<string, typeof note.items>, item: any) => {
        const mfgId = item.manufacturer_id;
        if (!acc[mfgId]) acc[mfgId] = [];
        acc[mfgId].push(item);
        return acc;
      }, {});

      // Get suppliers for each manufacturer
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, manufacturer_id')
        .in('manufacturer_id', Object.keys(itemsByManufacturer))
        .eq('is_active', true);
      
      if (suppliersError) throw suppliersError;

      const supplierByMfg = suppliers?.reduce((acc: Record<string, string>, s: any) => {
        acc[s.manufacturer_id] = s.id;
        return acc;
      }, {}) || {};

      // Create orders for each manufacturer with a supplier
      const ordersToCreate = [];
      for (const [mfgId, items] of Object.entries(itemsByManufacturer)) {
        const supplierId = supplierByMfg[mfgId];
        if (!supplierId) {
          toast.warning(`No supplier found for manufacturer. Some items skipped.`);
          continue;
        }

        const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        ordersToCreate.push({
          supplierId,
          orderNumber,
          items: items as any[],
        });
      }

      // Create each order with its items
      for (const order of ordersToCreate) {
        const { data: createdOrder, error: orderError } = await supabase
          .from('supplier_orders')
          .insert({
            user_id: user.id,
            supplier_id: order.supplierId,
            note_id: noteId,
            order_number: order.orderNumber,
            status: 'pending',
          })
          .select()
          .single();
        
        if (orderError) throw orderError;

        // Create order items
        const orderItems = order.items.map((item: any) => ({
          order_id: createdOrder.id,
          medicine_id: item.medicine_id,
          medicine_name: item.medicine?.name || 'Unknown',
          quantity: item.quantity,
          is_tax_applicable: item.is_tax_applicable,
          unit: item.medicine?.unit || 'pcs',
        }));

        const { error: itemsError } = await supabase
          .from('supplier_order_items')
          .insert(orderItems);
        
        if (itemsError) throw itemsError;
      }

      // Update note status
      const { error: updateError } = await supabase
        .from('stock_short_notes')
        .update({ status: 'completed' })
        .eq('id', noteId);
      
      if (updateError) throw updateError;

      return ordersToCreate.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['stock-short-notes'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      toast.success(`${count} order(s) created successfully`);
    },
    onError: (error) => {
      toast.error('Failed to complete note: ' + error.message);
    },
  });

  // Delete note
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('stock_short_notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-short-notes'] });
      toast.success('Note deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete note: ' + error.message);
    },
  });

  // Mark order as ordered
  const markAsOrderedMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('supplier_orders')
        .update({ 
          status: 'ordered',
          ordered_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      toast.success('Order marked as ordered');
    },
    onError: (error) => {
      toast.error('Failed to update order: ' + error.message);
    },
  });

  // Receive order
  const receiveOrderMutation = useMutation({
    mutationFn: async (data: {
      orderId: string;
      totalAmount: number;
      paidAmount: number;
      paymentMethod?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('supplier_orders')
        .select('supplier_id')
        .eq('id', data.orderId)
        .single();
      
      if (orderError) throw orderError;

      const dueAmount = data.totalAmount - data.paidAmount;

      // Update order
      const { error: updateError } = await supabase
        .from('supplier_orders')
        .update({
          status: 'received',
          received_at: new Date().toISOString(),
          total_amount: data.totalAmount,
          paid_amount: data.paidAmount,
          due_amount: dueAmount,
          payment_method: data.paymentMethod || null,
          notes: data.notes || null,
        })
        .eq('id', data.orderId);
      
      if (updateError) throw updateError;

      // If there's a paid amount, record supplier payment
      if (data.paidAmount > 0) {
        const { error: paymentError } = await supabase
          .from('supplier_payments')
          .insert({
            user_id: user.id,
            supplier_id: order.supplier_id,
            amount: data.paidAmount,
            payment_method: data.paymentMethod || 'cash',
            notes: `Payment for order - ${data.notes || ''}`.trim(),
          });
        
        if (paymentError) throw paymentError;
      }

      // If there's due amount, record supplier purchase (for due tracking)
      if (dueAmount > 0) {
        const { error: purchaseError } = await supabase
          .from('supplier_purchases')
          .insert({
            user_id: user.id,
            supplier_id: order.supplier_id,
            total_amount: data.totalAmount,
            paid_amount: data.paidAmount,
            due_amount: dueAmount,
            notes: `From order - ${data.notes || ''}`.trim(),
          });
        
        if (purchaseError) throw purchaseError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-purchases'] });
      toast.success('Order received successfully');
    },
    onError: (error) => {
      toast.error('Failed to receive order: ' + error.message);
    },
  });

  // Delete order
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('supplier_orders')
        .delete()
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] });
      toast.success('Order deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete order: ' + error.message);
    },
  });

  // Filter orders by status
  const pendingOrders = ordersQuery.data?.filter(o => o.status === 'pending') || [];
  const orderedOrders = ordersQuery.data?.filter(o => o.status === 'ordered') || [];
  const receivedOrders = ordersQuery.data?.filter(o => o.status === 'received') || [];

  return {
    notes: notesQuery.data || [],
    orders: ordersQuery.data || [],
    pendingOrders,
    orderedOrders,
    receivedOrders,
    isLoading: notesQuery.isLoading || ordersQuery.isLoading,
    createNote: createNoteMutation.mutateAsync,
    addItem: addItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    completeNote: completeNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    markAsOrdered: markAsOrderedMutation.mutateAsync,
    receiveOrder: receiveOrderMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
  };
}
