import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays, format } from 'date-fns';

export interface SidebarBadges {
  expiryAlerts: number;
  customerDues: number;
  supplierDues: number;
}

export function useSidebarBadges() {
  const { user } = useAuth();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const in30Days = format(addDays(today, 30), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['sidebar-badges', user?.id],
    queryFn: async (): Promise<SidebarBadges> => {
      // Fetch expiry alerts (expired + within 30 days)
      const { data: expiryData } = await supabase
        .from('medicine_batches')
        .select('expiry_date')
        .lte('expiry_date', in30Days);

      const expiryAlerts = expiryData?.length || 0;

      // Fetch customers with dues
      const { data: customerData } = await supabase
        .from('customers')
        .select('id')
        .eq('is_active', true)
        .gt('total_due', 0);

      const customerDues = customerData?.length || 0;

      // Fetch suppliers with dues
      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('id')
        .eq('is_active', true)
        .gt('total_due', 0);

      const supplierDues = supplierData?.length || 0;

      return {
        expiryAlerts,
        customerDues,
        supplierDues,
      };
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });
}
