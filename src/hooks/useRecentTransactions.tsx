import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday } from 'date-fns';

export interface Transaction {
  id: string;
  type: 'sale' | 'due_collection' | 'daily_cost' | 'supplier_payment';
  description: string;
  amount: number;
  time: string;
  timestamp: Date;
  isIncome: boolean;
}

export function useRecentTransactions(limit: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-transactions', user?.id, limit],
    queryFn: async (): Promise<Transaction[]> => {
      if (!user?.id) return [];

      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch all today's transactions in parallel
      const [salesRes, paymentsRes, costsRes, supplierPaymentsRes] = await Promise.all([
        // Today's sales
        supabase
          .from('sales')
          .select('id, invoice_number, total_amount, created_at')
          .eq('user_id', user.id)
          .eq('sale_date', today)
          .order('created_at', { ascending: false }),
        
        // Today's due collections (customer payments)
        supabase
          .from('customer_payments')
          .select('id, amount, payment_date, created_at, customers(name)')
          .eq('user_id', user.id)
          .eq('payment_date', today)
          .order('created_at', { ascending: false }),
        
        // Today's daily costs
        supabase
          .from('daily_costs')
          .select('id, description, amount, created_at')
          .eq('user_id', user.id)
          .eq('cost_date', today)
          .order('created_at', { ascending: false }),
        
        // Today's supplier payments
        supabase
          .from('supplier_payments')
          .select('id, amount, payment_date, created_at, suppliers(name)')
          .eq('user_id', user.id)
          .eq('payment_date', today)
          .order('created_at', { ascending: false }),
      ]);

      const transactions: Transaction[] = [];

      // Process sales
      if (salesRes.data) {
        salesRes.data.forEach(sale => {
          transactions.push({
            id: sale.id,
            type: 'sale',
            description: `বিক্রি ${sale.invoice_number}`,
            amount: sale.total_amount,
            time: format(new Date(sale.created_at), 'hh:mm a'),
            timestamp: new Date(sale.created_at),
            isIncome: true,
          });
        });
      }

      // Process customer payments (due collections)
      if (paymentsRes.data) {
        paymentsRes.data.forEach(payment => {
          const customerName = (payment.customers as any)?.name || 'Unknown';
          transactions.push({
            id: payment.id,
            type: 'due_collection',
            description: `বকেয়া আদায় - ${customerName}`,
            amount: payment.amount,
            time: format(new Date(payment.created_at), 'hh:mm a'),
            timestamp: new Date(payment.created_at),
            isIncome: true,
          });
        });
      }

      // Process daily costs
      if (costsRes.data) {
        costsRes.data.forEach(cost => {
          transactions.push({
            id: cost.id,
            type: 'daily_cost',
            description: `খরচ - ${cost.description}`,
            amount: cost.amount,
            time: format(new Date(cost.created_at), 'hh:mm a'),
            timestamp: new Date(cost.created_at),
            isIncome: false,
          });
        });
      }

      // Process supplier payments
      if (supplierPaymentsRes.data) {
        supplierPaymentsRes.data.forEach(payment => {
          const supplierName = (payment.suppliers as any)?.name || 'Unknown';
          transactions.push({
            id: payment.id,
            type: 'supplier_payment',
            description: `সাপ্লায়ার পেমেন্ট - ${supplierName}`,
            amount: payment.amount,
            time: format(new Date(payment.created_at), 'hh:mm a'),
            timestamp: new Date(payment.created_at),
            isIncome: false,
          });
        });
      }

      // Sort by timestamp and limit
      return transactions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes (was 30 seconds)
  });
}
