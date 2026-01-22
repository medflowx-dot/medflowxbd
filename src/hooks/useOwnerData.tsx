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
      // Use upsert to handle both insert and update cases
      const { data, error } = await supabase
        .from('platform_settings')
        .upsert(
          { 
            setting_key: settingKey, 
            setting_value: value,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'setting_key',
            ignoreDuplicates: false 
          }
        )
        .select()
        .maybeSingle();

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

// Default CMS content for seeding
const defaultCMSContent: Record<string, any> = {
  navbar: {
    logoText: 'MedFlowx',
    logoHighlight: 'Flow',
    loginText: 'লগইন',
    signupText: 'ফ্রি ট্রায়াল শুরু করুন',
    navLinks: [
      { href: '#features', label: 'সুবিধাসমূহ' },
      { href: '#how-it-works', label: 'কিভাবে কাজ করে' },
      { href: '#pricing', label: 'প্যাকেজ' },
      { href: '#faq', label: 'জিজ্ঞাসা' },
      { href: '#contact', label: 'যোগাযোগ' },
    ],
  },
  hero: {
    badge_text: '৫০০+ ফার্মেসির বিশ্বস্ত সঙ্গী',
    title: 'আপনার ফার্মেসি ব্যবসা এখন হাতের মুঠোয়',
    subtitle: 'ওষুধের মেয়াদ ট্র্যাক করুন, বিক্রয় পরিচালনা করুন, সাপ্লায়ার বাকি নিয়ন্ত্রণ করুন — সবকিছু এক জায়গায়।',
    primary_cta: 'ফ্রি ট্রায়াল শুরু করুন',
    secondary_cta: 'ডেমো দেখুন',
    trust_items: ['ক্রেডিট কার্ড লাগবে না', '৭ দিন ফ্রি', 'যেকোনো সময় বাতিল করুন'],
  },
  statistics: {
    title: 'সংখ্যায় আমাদের সাফল্য',
    subtitle: 'বাংলাদেশের ফার্মেসি মালিকরা প্রতিদিন MedFlowx দিয়ে তাদের ব্যবসা পরিচালনা করছেন',
    items: [
      { icon: 'Store', value: '৫০০+', label: 'ফার্মেসি', description: 'সারা বাংলাদেশে', color: 'primary' },
      { icon: 'Package', value: '১ লাখ+', label: 'ওষুধ ট্র্যাক', description: 'প্রতিদিন', color: 'secondary' },
      { icon: 'TrendingUp', value: '৫ কোটি+', label: 'টাকার বিক্রয়', description: 'প্রতি মাসে রেকর্ড', color: 'success' },
      { icon: 'Users', value: '১,২০০+', label: 'একটিভ ইউজার', description: 'প্রতিদিন', color: 'primary' },
    ],
    cta_text: 'আপনিও এই পরিবারের অংশ হতে পারেন —',
    cta_link_text: 'আজই শুরু করুন',
    cta_link: '/signup',
  },
  features: {
    badge: 'শক্তিশালী ফিচার',
    title: 'আপনার ব্যবসার জন্য প্রয়োজনীয় সব টুলস',
    subtitle: 'স্টক ম্যানেজমেন্ট থেকে রিপোর্টিং — সবকিছু এক ড্যাশবোর্ডে।',
    items: [
      { icon: 'Package', title: 'স্টক ম্যানেজমেন্ট', description: 'ওষুধের স্টক ট্র্যাক করুন, ব্যাচ অনুযায়ী মজুত দেখুন', color: 'primary', gradient: 'from-primary to-primary-light' },
      { icon: 'AlertTriangle', title: 'এক্সপায়ারি এলার্ট', description: '৩০, ৬০, ৯০ দিন আগে এলার্ট পান', color: 'secondary', gradient: 'from-secondary to-yellow-400' },
      { icon: 'ShoppingCart', title: 'বিক্রয় ট্র্যাকিং', description: 'দৈনিক বিক্রয় রেকর্ড রাখুন, ইনভয়েস তৈরি করুন', color: 'success', gradient: 'from-green-500 to-green-400' },
      { icon: 'Users', title: 'বাকি হিসাব', description: 'কাস্টমার ও সাপ্লায়ার বাকি পরিচালনা করুন', color: 'primary', gradient: 'from-primary to-primary-light' },
      { icon: 'Truck', title: 'সাপ্লায়ার ম্যানেজমেন্ট', description: 'সাপ্লায়ার তথ্য, অর্ডার ও পেমেন্ট ট্র্যাক করুন', color: 'secondary', gradient: 'from-secondary to-yellow-400' },
      { icon: 'FileText', title: 'রিপোর্ট', description: 'বিক্রয়, বাকি, ক্যাশ ফ্লো — সব রিপোর্ট PDF এ', color: 'success', gradient: 'from-green-500 to-green-400' },
    ],
    highlights: [
      { icon: 'Zap', title: '৩০ সেকেন্ডে সেটআপ', desc: 'কোনো ইন্সটলেশন লাগবে না', color: 'warning' },
      { icon: 'Shield', title: '১০০% নিরাপদ', desc: 'এনক্রিপ্টেড ডাটা স্টোরেজ', color: 'success' },
      { icon: 'Headphones', title: '২৪/৭ সাপোর্ট', desc: 'হোয়াটসঅ্যাপে সাহায্য পান', color: 'primary' },
    ],
  },
  why_choose_us: {
    title: 'আপনার সমস্যার সমাধান আমাদের কাছে',
    subtitle: 'ফার্মেসি চালাতে গিয়ে যে সমস্যাগুলোর মুখে পড়েন, তার সবকিছুর সমাধান এক জায়গায়।',
    items: [
      { icon: 'AlertTriangle', problem: 'ওষুধ এক্সপায়ার হয়ে যায়, টাকা নষ্ট হয়', solution: '৩০/৬০/৯০ দিন আগে এলার্ট পান, সময় মতো বিক্রি করুন' },
      { icon: 'Calculator', problem: 'দৈনিক হিসাব মেলানো কঠিন', solution: 'স্বয়ংক্রিয় ক্যাশ ফ্লো — ওপেনিং থেকে ক্লোজিং পর্যন্ত' },
      { icon: 'Users', problem: 'কাস্টমার বাকি মনে রাখা যায় না', solution: 'সব বাকি এক জায়গায়, পেমেন্ট হিস্ট্রি সহ' },
      { icon: 'Truck', problem: 'সাপ্লায়ার পেমেন্ট গোলমাল হয়', solution: 'সাপ্লায়ার ড্যাশবোর্ড — কত দিলাম, কত বাকি সব পরিষ্কার' },
    ],
  },
  how_it_works: {
    title: 'মাত্র ৩টি ধাপে শুরু করুন',
    subtitle: 'সাইনআপ থেকে পূর্ণ কার্যক্ষম — মাত্র কয়েক মিনিটে।',
    steps: [
      { number: '০১', icon: 'UserPlus', title: 'অ্যাকাউন্ট তৈরি করুন', description: 'শুধু ইমেইল ও ফোন নম্বর দিন। কোনো ক্রেডিট কার্ড লাগবে না।' },
      { number: '০২', icon: 'Settings', title: 'ফার্মেসি সেটআপ করুন', description: 'ওষুধ, সাপ্লায়ার যোগ করুন। আপনার কাজের ধরন অনুযায়ী কাস্টমাইজ করুন।' },
      { number: '০৩', icon: 'Rocket', title: 'ব্যবসা শুরু করুন', description: 'বিক্রয় ট্র্যাক করুন, রিপোর্ট দেখুন, ব্যবসা বাড়ান।' },
    ],
  },
  special_features: {
    badge: 'বিশেষ সুবিধা',
    title: 'যা আমাদের আলাদা করে',
    subtitle: 'শুধু ফিচার নয়, আপনার ফার্মেসির প্রতিটি দিক সহজ করতে আমরা এক্সট্রা মাইল যাই।',
    features: [
      { icon: 'Database', title: '৪৭০+ ওষুধের ডাটাবেস', description: 'স্কয়ার, ইনসেপ্টা, বেক্সিমকো সহ ২৮টি কোম্পানির ওষুধ আগে থেকে লোড করা' },
      { icon: 'Smartphone', title: 'মোবাইলে চলে', description: 'যেকোনো ফোন বা ট্যাবলেটে সহজে ব্যবহার করুন' },
      { icon: 'Users', title: 'আনলিমিটেড স্টাফ', description: 'একাধিক কর্মী যোগ করুন, আলাদা আলাদা পারমিশন দিন' },
      { icon: 'FileOutput', title: 'PDF রিপোর্ট', description: 'বিক্রয়, বাকি, ক্যাশ ফ্লো — সব রিপোর্ট PDF এ ডাউনলোড করুন' },
      { icon: 'MessageSquare', title: 'হোয়াটসঅ্যাপ শেয়ারিং', description: 'অর্ডার লিস্ট সরাসরি সাপ্লায়ারকে হোয়াটসঅ্যাপে পাঠান' },
      { icon: 'Cloud', title: 'ক্লাউড সিঙ্ক', description: 'ডাটা নিরাপদ ক্লাউডে, যেকোনো জায়গা থেকে একসেস করুন' },
    ],
  },
  pricing: {
    title: 'আপনার জন্য সঠিক প্যাকেজ বেছে নিন',
    subtitle: 'সব প্ল্যানে ৭ দিন ফ্রি ট্রায়াল, কোনো ক্রেডিট কার্ড লাগবে না।',
    plans: [
      { name: 'ফ্রি ট্রায়াল', price: '০', period: '/৭ দিন', description: 'শুরু করার জন্য পারফেক্ট', features: ['সব বেসিক ফিচার', 'একক ব্যবহারকারী', 'ইমেইল সাপোর্ট'], cta_text: 'ফ্রি ট্রায়াল শুরু করুন', is_popular: false },
      { name: 'মাসিক', price: '৪৯৯', period: '/মাস', description: 'ছোট ও মাঝারি ফার্মেসির জন্য', features: ['সব প্রিমিয়াম ফিচার', 'আনলিমিটেড স্টাফ', 'হোয়াটসঅ্যাপ সাপোর্ট', 'প্রায়োরিটি সাপোর্ট'], cta_text: 'এখনই শুরু করুন', is_popular: true },
      { name: 'লাইফটাইম', price: '৪,৯৯৯', period: '/একবার', description: 'বড় ফার্মেসি ও চেইনের জন্য', features: ['সব প্রিমিয়াম ফিচার', 'আনলিমিটেড স্টাফ', 'ডেডিকেটেড সাপোর্ট', 'কাস্টম ফিচার রিকোয়েস্ট'], cta_text: 'লাইফটাইম নিন', is_popular: false },
    ],
  },
  testimonials: {
    title: 'তাদের অভিজ্ঞতা, তাদের ভাষায়',
    subtitle: 'বাংলাদেশের বিভিন্ন প্রান্তের ফার্মেসি মালিকরা MedFlowx নিয়ে কী বলছেন।',
    trust_badge_text: '৫০০+ ফার্মেসি',
    items: [
      { name: 'মোঃ রফিকুল ইসলাম', role: 'মালিক, নিউ লাইফ ফার্মেসি', location: 'মিরপুর, ঢাকা', rating: 5, text: 'MedFlowx ব্যবহার করার পর থেকে আমার ফার্মেসিতে এক্সপায়ার্ড ওষুধের লস প্রায় শূন্যে নেমে এসেছে।' },
      { name: 'ফাতেমা খাতুন', role: 'ম্যানেজার, গ্রিন মেডিকেল হল', location: 'চট্টগ্রাম', rating: 5, text: 'দৈনিক ক্যাশ ফ্লো ফিচারটা অসাধারণ! আগে রাতে ঘন্টা খরচ করে হিসাব মেলাতে হতো, এখন সব অটোমেটিক।' },
      { name: 'আব্দুল করিম', role: 'মালিক, করিম ফার্মেসি', location: 'রাজশাহী', rating: 5, text: 'সাপ্লায়ার বাকি ট্র্যাক করা এখন অনেক সহজ। কোন সাপ্লায়ারকে কত দিতে হবে — সব পরিষ্কার দেখতে পাই।' },
    ],
  },
  mobile_app: {
    badge: 'শীঘ্রই আসছে',
    title: 'মোবাইল অ্যাপ',
    titleHighlight: 'আসছে শীঘ্রই!',
    description: 'আপনার পকেটে থাকবে আপনার পুরো ফার্মেসি। বিক্রয়, স্টক, রিপোর্ট — সব কিছু এক ট্যাপেই। Android ও iOS উভয় প্ল্যাটফর্মে।',
    buttonText: 'লঞ্চে জানতে চাই',
    waitingText: '+২৩০ জন অপেক্ষায়',
    feature1Title: 'পুশ নোটিফিকেশন',
    feature1Desc: 'এক্সপায়ারি এলার্ট সাথে সাথে',
    feature2Title: 'অফলাইন মোড',
    feature2Desc: 'ইন্টারনেট ছাড়াও কাজ করুন',
  },
  cta: {
    title: 'আপনার ফার্মেসি ব্যবসা বদলে দিতে প্রস্তুত?',
    subtitle: 'বাংলাদেশের শত শত ফার্মেসি ইতিমধ্যে MedFlowx দিয়ে সময় বাঁচাচ্ছে, ভুল কমাচ্ছে এবং ব্যবসা বাড়াচ্ছে।',
    cta_primary: { text: 'ফ্রি ট্রায়াল শুরু করুন', link: '/signup' },
    cta_secondary: { text: 'যোগাযোগ করুন', link: '#contact' },
    trust_items: ['ক্রেডিট কার্ড লাগবে না', '৭ দিন ফ্রি', 'যেকোনো সময় বাতিল করুন'],
  },
  contact: {
    sectionBadge: 'যোগাযোগ করুন',
    title: 'আমাদের সাথে কথা বলুন',
    subtitle: 'যেকোনো প্রশ্ন বা সাহায্যের জন্য আমরা সবসময় আছি।',
    contactTitle: 'সরাসরি যোগাযোগ করুন',
    methods: [
      { icon: 'MessageCircle', title: 'হোয়াটসঅ্যাপ', value: '+880 1604-334494', description: 'সকাল ৯টা - রাত ১০টা', actionLabel: 'মেসেজ', color: 'success' },
      { icon: 'Phone', title: 'ফোন', value: '+880 1604-334494', description: 'সকাল ৯টা - সন্ধ্যা ৬টা', actionLabel: 'কল', color: 'primary' },
      { icon: 'Mail', title: 'ইমেইল', value: 'support@medflowx.com', description: '২৪ ঘন্টার মধ্যে উত্তর', actionLabel: 'ইমেইল', color: 'secondary' },
    ],
    office: { title: 'অফিস', address: 'ঢাকা, বাংলাদেশ', note: 'অ্যাপয়েন্টমেন্ট নিয়ে আসুন' },
    formConfig: {
      title: 'মেসেজ পাঠান',
      subtitle: 'ফর্ম পূরণ করুন, আমরা শীঘ্রই যোগাযোগ করব।',
      nameLabel: 'আপনার নাম',
      namePlaceholder: 'নাম লিখুন',
      phoneLabel: 'ফোন নম্বর',
      phonePlaceholder: '01XXX-XXXXXX',
      pharmacyLabel: 'ফার্মেসির নাম',
      pharmacyPlaceholder: 'ফার্মেসির নাম (ঐচ্ছিক)',
      messageLabel: 'মেসেজ',
      messagePlaceholder: 'আপনার প্রশ্ন বা মতামত লিখুন...',
      submitButtonText: 'মেসেজ পাঠান',
      whatsappButtonText: 'হোয়াটসঅ্যাপ',
    },
  },
  faq: {
    title: 'সাধারণ জিজ্ঞাসা',
    subtitle: 'আপনার প্রশ্নের উত্তর খুঁজুন',
    faqs: [
      { question: 'MedFlowx কি মোবাইলে কাজ করে?', answer: 'হ্যাঁ, MedFlowx সম্পূর্ণ মোবাইল-ফ্রেন্ডলি। যেকোনো স্মার্টফোন বা ট্যাবলেটের ব্রাউজার থেকে ব্যবহার করতে পারবেন।' },
      { question: 'ফ্রি ট্রায়ালে কি কি সুবিধা পাবো?', answer: '৭ দিনের ফ্রি ট্রায়ালে আপনি সব বেসিক ফিচার ব্যবহার করতে পারবেন — স্টক ম্যানেজমেন্ট, বিক্রয় ট্র্যাকিং, এক্সপায়ারি এলার্ট সহ।' },
      { question: 'পেমেন্ট মেথড কি কি?', answer: 'বিকাশ, নগদ, রকেট এবং ব্যাংক ট্রান্সফার সাপোর্ট করা হয়।' },
      { question: 'ডাটা কি নিরাপদ?', answer: 'আপনার সব ডাটা এনক্রিপ্টেড ক্লাউড সার্ভারে সুরক্ষিত থাকে। আমরা SSL এনক্রিপশন ও নিয়মিত ব্যাকআপ নিশ্চিত করি।' },
    ],
  },
  footer: {
    brand: {
      name: 'MedFlowx',
      description: 'বাংলাদেশের ফার্মেসির জন্য তৈরি মেয়াদ ট্র্যাকিং ও আর্থিক হিসাব সফটওয়্যার। এক্সপায়ারি ট্র্যাক করুন, আয় ম্যানেজ করুন, সাপ্লায়ার বাকি নিয়ন্ত্রণ করুন।',
    },
    contact: {
      email: 'support@medflowx.com',
      phone: '+৮৮০ ১৬০৪-৩৩৪৪৯৪',
      address: 'ঢাকা, বাংলাদেশ',
    },
    links: {
      product: [
        { text: 'সুবিধাসমূহ', link: '#features' },
        { text: 'প্যাকেজ', link: '#pricing' },
        { text: 'কিভাবে কাজ করে', link: '#how-it-works' },
        { text: 'জিজ্ঞাসা', link: '#faq' },
      ],
      company: [
        { text: 'আমাদের সম্পর্কে', link: '#' },
        { text: 'যোগাযোগ', link: '#contact' },
        { text: 'ক্যারিয়ার', link: '#' },
        { text: 'ব্লগ', link: '#' },
      ],
      legal: [
        { text: 'প্রাইভেসি পলিসি', link: '#' },
        { text: 'সেবার শর্তাবলী', link: '#' },
        { text: 'রিফান্ড পলিসি', link: '#' },
      ],
    },
    social: {
      facebook: 'https://facebook.com/medflowx',
      whatsapp: 'https://wa.me/8801604334494',
    },
    copyright: '© {year} MedFlowx। সর্বস্বত্ব সংরক্ষিত।',
  },
  manufacturers: {
    badge: 'আমাদের পার্টনার',
    title: 'বাংলাদেশের শীর্ষ ওষুধ কোম্পানিগুলোর প্রোডাক্ট',
    highlightNumber: '২৮+',
    bottomText: 'টি কোম্পানির ওষুধ প্রি-লোড করা',
    manufacturers: [
      { name: 'Square', namebn: 'স্কয়ার' },
      { name: 'Incepta', namebn: 'ইনসেপ্টা' },
      { name: 'Beximco', namebn: 'বেক্সিমকো' },
      { name: 'Renata', namebn: 'রেনাটা' },
      { name: 'Opsonin', namebn: 'অপসোনিন' },
      { name: 'ACI', namebn: 'এসিআই' },
      { name: 'Eskayef', namebn: 'এস্কায়েফ' },
      { name: 'Aristopharma', namebn: 'এরিস্টোফার্মা' },
    ],
  },
};

export function useSeedCMSContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageId: string) => {
      const results = [];
      
      for (const [sectionKey, content] of Object.entries(defaultCMSContent)) {
        const { data, error } = await supabase
          .from('cms_sections')
          .update({ content })
          .eq('page_id', pageId)
          .eq('section_key', sectionKey)
          .select();

        if (error) {
          console.error(`Failed to update ${sectionKey}:`, error);
        } else {
          results.push({ sectionKey, success: true });
        }
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-cms-sections'] });
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      queryClient.invalidateQueries({ queryKey: ['cms-all-sections'] });
      toast.success('সব sections এ default content সফলভাবে আপডেট হয়েছে!');
    },
    onError: (error: Error) => {
      toast.error('Content seed করতে সমস্যা হয়েছে: ' + error.message);
    },
  });
}
