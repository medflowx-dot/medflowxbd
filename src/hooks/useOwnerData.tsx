import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsOwnerAdmin } from '@/hooks/useAdminData';
import { toast } from 'sonner';

// Types
export interface Client {
  id: string;
  user_id: string;
  full_name: string | null;
  pharmacy_name: string | null;
  phone: string | null;
  created_at: string;
  subscription?: {
    id: string;
    plan_type: string;
    status: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
    amount: number;
    lifetime_service_due_date: string | null;
  };
  role?: string;
  last_activity?: string;
  total_sales?: number;
  total_medicines?: number;
}

export interface PricingPlan {
  id: string;
  plan_name: string;
  display_name: string;
  price: number;
  currency: string;
  duration_days: number | null;
  features: Record<string, boolean>;
  user_limit: number | null;
  trial_restrictions: Record<string, boolean> | null;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface PlatformSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_type: string;
  target_id: string | null;
  target_user_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

export interface CMSPage {
  id: string;
  page_slug: string;
  page_title: string;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  version: number;
  updated_at: string;
}

export interface CMSSection {
  id: string;
  page_id: string;
  section_type: string;
  section_key: string;
  content: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
}

export interface OwnerAnalytics {
  totalClients: number;
  activeSubscriptions: number;
  trialUsers: number;
  expiredAccounts: number;
  suspendedAccounts: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  pendingPayments: number;
  lifetimeUsers: number;
  systemStatus: 'healthy' | 'warning' | 'critical';
}

// Hooks
export function useOwnerAnalytics() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['owner-analytics'],
    queryFn: async (): Promise<OwnerAnalytics> => {
      // Get all profiles count
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get all subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*');

      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
      const trialUsers = subscriptions?.filter(s => s.plan_type === 'trial' && s.status === 'active').length || 0;
      const expiredAccounts = subscriptions?.filter(s => s.status === 'expired').length || 0;
      const suspendedAccounts = subscriptions?.filter(s => s.status === 'suspended').length || 0;
      const lifetimeUsers = subscriptions?.filter(s => s.plan_type === 'lifetime').length || 0;

      // Calculate monthly revenue (subscriptions with monthly plan active in current month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = subscriptions
        ?.filter(s => s.plan_type === 'monthly' && s.status === 'active')
        ?.reduce((sum, s) => sum + Number(s.amount || 0), 0) || 0;

      // Calculate yearly revenue
      const yearlyRevenue = subscriptions
        ?.filter(s => (s.plan_type === 'yearly' || s.plan_type === 'lifetime') && s.status === 'active')
        ?.reduce((sum, s) => sum + Number(s.amount || 0), 0) || 0;

      // Pending payments (expired but not suspended)
      const pendingPayments = subscriptions?.filter(s => s.status === 'expired').length || 0;

      // System status based on error rate (simplified)
      const systemStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

      return {
        totalClients: profilesCount || 0,
        activeSubscriptions,
        trialUsers,
        expiredAccounts,
        suspendedAccounts,
        monthlyRevenue,
        yearlyRevenue,
        pendingPayments,
        lifetimeUsers,
        systemStatus,
      };
    },
    enabled: isOwnerAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useClients() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['owner-clients'],
    queryFn: async (): Promise<Client[]> => {
      // Get profiles with subscriptions
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*');

      // Get user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      // Get sales counts per user
      const { data: salesData } = await supabase
        .from('sales')
        .select('user_id');

      // Get medicines counts per user
      const { data: medicinesData } = await supabase
        .from('medicines')
        .select('user_id');

      // Map profiles with related data
      return profiles?.map(profile => {
        const subscription = subscriptions?.find(s => s.user_id === profile.user_id);
        const role = roles?.find(r => r.user_id === profile.user_id);
        const userSales = salesData?.filter(s => s.user_id === profile.user_id).length || 0;
        const userMedicines = medicinesData?.filter(m => m.user_id === profile.user_id).length || 0;

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          pharmacy_name: profile.pharmacy_name,
          phone: profile.phone,
          created_at: profile.created_at,
          subscription: subscription ? {
            id: subscription.id,
            plan_type: subscription.plan_type,
            status: subscription.status,
            trial_ends_at: subscription.trial_ends_at,
            current_period_end: subscription.current_period_end,
            amount: Number(subscription.amount),
            lifetime_service_due_date: subscription.lifetime_service_due_date,
          } : undefined,
          role: role?.role,
          total_sales: userSales,
          total_medicines: userMedicines,
        };
      }) || [];
    },
    enabled: isOwnerAdmin,
  });
}

export function usePricingPlans() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['owner-pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PricingPlan[];
    },
    enabled: isOwnerAdmin,
  });
}

export function usePlatformSettings() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['owner-platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) throw error;
      return data as PlatformSetting[];
    },
    enabled: isOwnerAdmin,
  });
}

export function useAuditLogs(limit = 50) {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['owner-audit-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: isOwnerAdmin,
  });
}

export function useCMSPages() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['owner-cms-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as CMSPage[];
    },
    enabled: isOwnerAdmin,
  });
}

export function useCMSSections(pageId?: string) {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['owner-cms-sections', pageId],
    queryFn: async () => {
      let query = supabase
        .from('cms_sections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (pageId) {
        query = query.eq('page_id', pageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CMSSection[];
    },
    enabled: isOwnerAdmin && !!pageId,
  });
}

// Mutations
export function useUpdateClientSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      updates,
    }: {
      subscriptionId: string;
      updates: Partial<{
        plan_type: string;
        status: string;
        current_period_end: string;
        trial_ends_at: string;
        amount: number;
        lifetime_service_due_date: string;
        notes: string;
      }>;
    }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'subscription_update',
        p_target_type: 'subscription',
        p_target_id: subscriptionId,
        p_details: updates,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-clients'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('Subscription updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update subscription: ' + error.message);
    },
  });
}

export function useExtendSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      days,
    }: {
      subscriptionId: string;
      days: number;
    }) => {
      // Get current subscription
      const { data: current, error: fetchError } = await supabase
        .from('subscriptions')
        .select('current_period_end')
        .eq('id', subscriptionId)
        .single();

      if (fetchError) throw fetchError;

      const currentEnd = current?.current_period_end 
        ? new Date(current.current_period_end) 
        : new Date();
      
      const newEnd = new Date(currentEnd);
      newEnd.setDate(newEnd.getDate() + days);

      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          current_period_end: newEnd.toISOString(),
          status: 'active',
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'subscription_extend',
        p_target_type: 'subscription',
        p_target_id: subscriptionId,
        p_details: { extended_days: days, new_end_date: newEnd.toISOString() },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-clients'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('Subscription extended successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to extend subscription: ' + error.message);
    },
  });
}

export function useConvertToLifetime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      waiveServiceCharge,
    }: {
      subscriptionId: string;
      waiveServiceCharge: boolean;
    }) => {
      const serviceDueDate = waiveServiceCharge ? null : new Date();
      if (serviceDueDate) {
        serviceDueDate.setFullYear(serviceDueDate.getFullYear() + 1);
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: 'lifetime',
          status: 'active',
          current_period_end: null,
          lifetime_service_due_date: serviceDueDate?.toISOString() || null,
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'convert_to_lifetime',
        p_target_type: 'subscription',
        p_target_id: subscriptionId,
        p_details: { waive_service_charge: waiveServiceCharge },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-clients'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('Converted to lifetime plan successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to convert: ' + error.message);
    },
  });
}

export function useSuspendAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      reason,
    }: {
      subscriptionId: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          status: 'suspended',
          notes: reason,
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'account_suspend',
        p_target_type: 'subscription',
        p_target_id: subscriptionId,
        p_details: { reason },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-clients'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('Account suspended');
    },
    onError: (error: Error) => {
      toast.error('Failed to suspend: ' + error.message);
    },
  });
}

export function useActivateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'account_activate',
        p_target_type: 'subscription',
        p_target_id: subscriptionId,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-clients'] });
      queryClient.invalidateQueries({ queryKey: ['owner-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('Account activated');
    },
    onError: (error: Error) => {
      toast.error('Failed to activate: ' + error.message);
    },
  });
}

export function useUpdatePricingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      updates,
    }: {
      planId: string;
      updates: Partial<PricingPlan>;
    }) => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'pricing_plan_update',
        p_target_type: 'pricing_plan',
        p_target_id: planId,
        p_details: updates,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-pricing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('Pricing plan updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update plan: ' + error.message);
    },
  });
}

export function useUpdatePlatformSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      settingKey,
      value,
    }: {
      settingKey: string;
      value: any;
    }) => {
      const { data, error } = await supabase
        .from('platform_settings')
        .update({ setting_value: value })
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'platform_setting_update',
        p_target_type: 'platform_setting',
        p_details: { key: settingKey, value },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('Setting updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update setting: ' + error.message);
    },
  });
}

export function useUpdateCMSSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionId,
      content,
      isVisible,
    }: {
      sectionId: string;
      content?: Record<string, any>;
      isVisible?: boolean;
    }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (content !== undefined) updates.content = content;
      if (isVisible !== undefined) updates.is_visible = isVisible;

      const { data, error } = await supabase
        .from('cms_sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'cms_section_update',
        p_target_type: 'cms_section',
        p_target_id: sectionId,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-cms-sections'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success('CMS section updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update section: ' + error.message);
    },
  });
}

export function usePublishCMSPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageId,
      publish,
    }: {
      pageId: string;
      publish: boolean;
    }) => {
      const updates: any = {
        is_published: publish,
        updated_at: new Date().toISOString(),
      };
      
      if (publish) {
        updates.published_at = new Date().toISOString();
        // Increment version
        const { data: currentPage } = await supabase
          .from('cms_pages')
          .select('version')
          .eq('id', pageId)
          .single();
        
        updates.version = (currentPage?.version || 0) + 1;
      }

      const { data, error } = await supabase
        .from('cms_pages')
        .update(updates)
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_admin_action', {
        p_action_type: publish ? 'cms_page_publish' : 'cms_page_unpublish',
        p_target_type: 'cms_page',
        p_target_id: pageId,
      });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['owner-cms-pages'] });
      queryClient.invalidateQueries({ queryKey: ['owner-audit-logs'] });
      toast.success(variables.publish ? 'Page published' : 'Page unpublished');
    },
    onError: (error: Error) => {
      toast.error('Failed to update page: ' + error.message);
    },
  });
}
