import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FeatureFlag {
  id: string;
  feature_key: string;
  display_name: string;
  description: string | null;
  is_enabled: boolean;
  module_type: string;
  created_at: string;
  updated_at: string;
}

// Map feature keys to route paths
const featureToRouteMap: Record<string, string[]> = {
  medicines: ['/dashboard/medicines'],
  batches: ['/dashboard/medicines'],
  expiry_monitor: ['/dashboard/expiry'],
  alerts: ['/dashboard/alerts'],
  sales: ['/dashboard/sales'],
  customer_dues: ['/dashboard/customer-dues'],
  suppliers: ['/dashboard/suppliers'],
  manufacturers: ['/dashboard/manufacturers'],
  daily_cash: ['/dashboard/daily-cash'],
  stock_short: ['/dashboard/stock-short'],
  reports: ['/dashboard/reports'],
  settings: ['/dashboard/settings'],
};

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('display_name');

      if (error) throw error;
      return data as FeatureFlag[];
    },
  });
}

export function useEnabledFeatures() {
  const { data: flags, isLoading } = useFeatureFlags();

  const enabledFeatureKeys = flags
    ?.filter(f => f.is_enabled)
    .map(f => f.feature_key) || [];

  const isFeatureEnabled = (featureKey: string): boolean => {
    return enabledFeatureKeys.includes(featureKey);
  };

  const isRouteEnabled = (route: string): boolean => {
    // Dashboard is always enabled
    if (route === '/dashboard') return true;
    
    // Find which feature controls this route
    for (const [featureKey, routes] of Object.entries(featureToRouteMap)) {
      if (routes.includes(route)) {
        return isFeatureEnabled(featureKey);
      }
    }
    
    // Routes not mapped to features are enabled by default
    return true;
  };

  return {
    enabledFeatureKeys,
    isFeatureEnabled,
    isRouteEnabled,
    isLoading,
  };
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { data, error } = await supabase
        .from('feature_flags')
        .update({ is_enabled })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag updated');
    },
    onError: (error) => {
      toast.error('Failed to update feature flag: ' + error.message);
    },
  });
}

export function useBulkUpdateFeatureFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; is_enabled: boolean }[]) => {
      const promises = updates.map(({ id, is_enabled }) =>
        supabase
          .from('feature_flags')
          .update({ is_enabled })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error('Some updates failed');
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('All feature flags updated');
    },
    onError: (error) => {
      toast.error('Failed to update feature flags: ' + error.message);
    },
  });
}
