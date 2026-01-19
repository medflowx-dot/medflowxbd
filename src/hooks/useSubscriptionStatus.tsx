import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsOwnerAdmin } from '@/hooks/useAdminData';

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  isSuspended: boolean;
  planType: string | null;
  expiresAt: string | null;
  trialEndsAt: string | null;
  daysRemaining: number | null;
}

export function useSubscriptionStatus() {
  const { user } = useAuth();
  const { isOwnerAdmin, isLoading: roleLoading } = useIsOwnerAdmin();

  const { data, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user?.id) {
        return {
          isActive: false,
          isTrial: false,
          isExpired: true,
          isSuspended: false,
          planType: null,
          expiresAt: null,
          trialEndsAt: null,
          daysRemaining: null,
        };
      }

      // Query subscription - RLS policy handles pharmacy owner lookup
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error || !subscription) {
        return {
          isActive: false,
          isTrial: false,
          isExpired: true,
          isSuspended: false,
          planType: null,
          expiresAt: null,
          trialEndsAt: null,
          daysRemaining: null,
        };
      }

      const now = new Date();
      const isTrial = subscription.plan_type === 'trial';
      const isLifetime = subscription.plan_type === 'lifetime';
      
      // Check expiry
      let isExpired = false;
      let daysRemaining: number | null = null;
      
      if (isTrial && subscription.trial_ends_at) {
        const trialEnd = new Date(subscription.trial_ends_at);
        isExpired = trialEnd < now;
        daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else if (!isLifetime && subscription.current_period_end) {
        const periodEnd = new Date(subscription.current_period_end);
        isExpired = periodEnd < now;
        daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      } else if (isLifetime) {
        // Lifetime plans don't expire (but may have service charge due)
        isExpired = false;
        daysRemaining = null;
      }

      const isSuspended = subscription.status === 'suspended';
      const isActive = subscription.status === 'active' && !isExpired && !isSuspended;

      return {
        isActive,
        isTrial,
        isExpired,
        isSuspended,
        planType: subscription.plan_type,
        expiresAt: subscription.current_period_end,
        trialEndsAt: subscription.trial_ends_at,
        daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : null,
      };
    },
    enabled: !!user?.id,
  });

  // Owner admin always has access
  const effectiveStatus: SubscriptionStatus = isOwnerAdmin 
    ? {
        isActive: true,
        isTrial: false,
        isExpired: false,
        isSuspended: false,
        planType: 'owner',
        expiresAt: null,
        trialEndsAt: null,
        daysRemaining: null,
      }
    : data || {
        isActive: false,
        isTrial: false,
        isExpired: true,
        isSuspended: false,
        planType: null,
        expiresAt: null,
        trialEndsAt: null,
        daysRemaining: null,
      };

  return {
    ...effectiveStatus,
    isLoading: subscriptionLoading || roleLoading,
    isOwnerAdmin,
  };
}
