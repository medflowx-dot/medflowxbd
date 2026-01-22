import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CustomerDueAlert {
  id: string;
  name: string;
  phone: string | null;
  totalDue: number;
}

export interface SupplierDueAlert {
  id: string;
  name: string;
  phone: string | null;
  totalDue: number;
}

export interface DueAlertsData {
  topCustomers: CustomerDueAlert[];
  topSuppliers: SupplierDueAlert[];
  totalCustomerDue: number;
  totalSupplierDue: number;
  customerCount: number;
  supplierCount: number;
}

export function useDueAlerts(limit: number = 3) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['due-alerts', user?.id, limit],
    queryFn: async (): Promise<DueAlertsData> => {
      if (!user?.id) {
        return {
          topCustomers: [],
          topSuppliers: [],
          totalCustomerDue: 0,
          totalSupplierDue: 0,
          customerCount: 0,
          supplierCount: 0,
        };
      }

      // Fetch customers and suppliers with dues in parallel
      const [customersRes, suppliersRes] = await Promise.all([
        supabase
          .from('customers')
          .select('id, name, phone, total_due')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('total_due', 0)
          .order('total_due', { ascending: false }),
        
        supabase
          .from('suppliers')
          .select('id, name, phone, total_due')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('total_due', 0)
          .order('total_due', { ascending: false }),
      ]);

      const customers = customersRes.data || [];
      const suppliers = suppliersRes.data || [];

      // Calculate totals
      const totalCustomerDue = customers.reduce((sum, c) => sum + Number(c.total_due), 0);
      const totalSupplierDue = suppliers.reduce((sum, s) => sum + Number(s.total_due), 0);

      return {
        topCustomers: customers.slice(0, limit).map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          totalDue: c.total_due,
        })),
        topSuppliers: suppliers.slice(0, limit).map(s => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          totalDue: s.total_due,
        })),
        totalCustomerDue,
        totalSupplierDue,
        customerCount: customers.length,
        supplierCount: suppliers.length,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes (was 1 min)
  });
}
