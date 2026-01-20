import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingPlan {
  id: string;
  plan_name: string;
  display_name: string;
  price: number;
  currency: string;
  duration_days: number | null;
  features: Record<string, boolean> | null;
  is_active: boolean;
  sort_order: number | null;
  user_limit: number | null;
}

// Public hook - fetches pricing plans without auth requirement
export function usePricingPlansPublic() {
  return useQuery({
    queryKey: ['pricing-plans-public'],
    queryFn: async (): Promise<PricingPlan[]> => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching pricing plans:', error);
        return [];
      }

      return (data || []) as PricingPlan[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
