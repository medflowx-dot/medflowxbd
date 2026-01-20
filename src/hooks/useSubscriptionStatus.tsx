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
      const isSuspended = subscription.status === 'suspended';
      
      // Determine expiry based on plan type
      let isExpired = false;
      let daysRemaining: number | null = null;
      let relevantEndDate: string | null = null;
      
      if (isLifetime) {
        // Lifetime plans never expire (service charge is separate)
        isExpired = false;
        daysRemaining = null;
        relevantEndDate = subscription.lifetime_service_due_date;
      } else if (isTrial) {
        // Trial plans use trial_ends_at
        if (subscription.trial_ends_at) {
          const trialEnd = new Date(subscription.trial_ends_at);
          isExpired = now > trialEnd;
          const diffMs = trialEnd.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          relevantEndDate = subscription.trial_ends_at;
        } else {
          // No trial end date set - consider expired
          isExpired = true;
        }
      } else {
        // Monthly/Yearly plans use current_period_end
        if (subscription.current_period_end) {
          const periodEnd = new Date(subscription.current_period_end);
          isExpired = now > periodEnd;
          const diffMs = periodEnd.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          relevantEndDate = subscription.current_period_end;
        } else {
          // No period end - consider expired for safety
          isExpired = true;
        }
      }

      // Primary check: If database status is 'active' and not suspended, trust it
      // Only override if the date has truly passed
      const isActive = subscription.status === 'active' && !isSuspended && !isExpired;

      return {
        isActive,
        isTrial,
        isExpired,
        isSuspended,
        planType: subscription.plan_type,
        expiresAt: subscription.current_period_end,
        trialEndsAt: subscription.trial_ends_at,
        daysRemaining: daysRemaining !== null && daysRemaining > 0 ? daysRemaining : null,
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
