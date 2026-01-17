import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays, format } from 'date-fns';

export interface ExpiryBatch {
  id: string;
  batch_number: string;
  expiry_date: string;
  medicine_id: string;
  medicine_name: string;
  manufacturer: string | null;
  category: string | null;
  daysUntilExpiry: number;
  status: 'expired' | 'critical' | 'warning' | 'caution' | 'safe';
}

export type ExpiryFilter = 'all' | 'expired' | '30days' | '60days' | '90days' | 'custom';

export function useExpiryMonitoring(filter: ExpiryFilter, customRange?: { from: Date; to: Date }) {
  const { user } = useAuth();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['expiry-monitoring', user?.id, filter, customRange?.from?.toISOString(), customRange?.to?.toISOString()],
    queryFn: async (): Promise<ExpiryBatch[]> => {
      let query = supabase
        .from('medicine_batches')
        .select(`
          id,
          batch_number,
          expiry_date,
          medicine_id,
          medicines (
            name,
            manufacturer,
            category
          )
        `)
        .order('expiry_date', { ascending: true });

      // Apply date filters
      if (filter === 'expired') {
        query = query.lt('expiry_date', todayStr);
      } else if (filter === '30days') {
        const endDate = format(addDays(today, 30), 'yyyy-MM-dd');
        query = query.gte('expiry_date', todayStr).lte('expiry_date', endDate);
      } else if (filter === '60days') {
        const endDate = format(addDays(today, 60), 'yyyy-MM-dd');
        query = query.gte('expiry_date', todayStr).lte('expiry_date', endDate);
      } else if (filter === '90days') {
        const endDate = format(addDays(today, 90), 'yyyy-MM-dd');
        query = query.gte('expiry_date', todayStr).lte('expiry_date', endDate);
      } else if (filter === 'custom' && customRange) {
        query = query
          .gte('expiry_date', format(customRange.from, 'yyyy-MM-dd'))
          .lte('expiry_date', format(customRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((batch: any) => {
        const expiryDate = new Date(batch.expiry_date);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        let status: ExpiryBatch['status'];
        if (daysUntilExpiry < 0) {
          status = 'expired';
        } else if (daysUntilExpiry <= 30) {
          status = 'critical';
        } else if (daysUntilExpiry <= 60) {
          status = 'warning';
        } else if (daysUntilExpiry <= 90) {
          status = 'caution';
        } else {
          status = 'safe';
        }

        return {
          id: batch.id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          medicine_id: batch.medicine_id,
          medicine_name: batch.medicines?.name || 'Unknown',
          manufacturer: batch.medicines?.manufacturer,
          category: batch.medicines?.category,
          daysUntilExpiry,
          status,
        };
      });
    },
    enabled: !!user,
  });
}

export function useExpirySummary() {
  const { user } = useAuth();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['expiry-summary', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_batches')
        .select('expiry_date');

      if (error) throw error;

      let expired = { count: 0 };
      let within30Days = { count: 0 };
      let within60Days = { count: 0 };
      let within90Days = { count: 0 };

      const in30Days = format(addDays(today, 30), 'yyyy-MM-dd');
      const in60Days = format(addDays(today, 60), 'yyyy-MM-dd');
      const in90Days = format(addDays(today, 90), 'yyyy-MM-dd');

      (data || []).forEach((batch) => {
        if (batch.expiry_date < todayStr) {
          expired.count++;
        } else if (batch.expiry_date <= in30Days) {
          within30Days.count++;
        } else if (batch.expiry_date <= in60Days) {
          within60Days.count++;
        } else if (batch.expiry_date <= in90Days) {
          within90Days.count++;
        }
      });

      return {
        expired,
        within30Days,
        within60Days,
        within90Days,
        totalAtRisk: expired.count + within30Days.count + within60Days.count + within90Days.count,
      };
    },
    enabled: !!user,
  });
}
