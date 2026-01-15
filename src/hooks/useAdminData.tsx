import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile: {
    full_name: string | null;
    pharmacy_name: string | null;
    phone: string | null;
  } | null;
  role: string;
  subscription: {
    plan_type: string;
    status: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
  } | null;
}

interface SystemAnalytics {
  totalPharmacies: number;
  activeSubscriptions: number;
  trialUsers: number;
  totalSales: number;
  totalRevenue: number;
  totalMedicines: number;
}

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data?.role as 'owner_admin' | 'client_admin' | 'client_staff';
    },
    enabled: !!user?.id,
  });
}

export function useIsOwnerAdmin() {
  const { data: role, isLoading } = useUserRole();
  return { isOwnerAdmin: role === 'owner_admin', isLoading };
}

export function useAllProfiles() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['admin-all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOwnerAdmin,
  });
}

export function useAllSubscriptions() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['admin-all-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOwnerAdmin,
  });
}

export function useAllUserRoles() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['admin-all-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isOwnerAdmin,
  });
}

export function useSystemAnalytics() {
  const { isOwnerAdmin } = useIsOwnerAdmin();

  return useQuery({
    queryKey: ['admin-system-analytics'],
    queryFn: async (): Promise<SystemAnalytics> => {
      // Get total pharmacies (profiles)
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get subscriptions data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, plan_type');

      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
      const trialUsers = subscriptions?.filter(s => s.plan_type === 'trial').length || 0;

      // Get total sales count
      const { count: salesCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount');
      
      const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Get total medicines
      const { count: medicinesCount } = await supabase
        .from('medicines')
        .select('*', { count: 'exact', head: true });

      return {
        totalPharmacies: profilesCount || 0,
        activeSubscriptions,
        trialUsers,
        totalSales: salesCount || 0,
        totalRevenue,
        totalMedicines: medicinesCount || 0,
      };
    },
    enabled: isOwnerAdmin,
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      updates 
    }: { 
      subscriptionId: string; 
      updates: {
        plan_type?: string;
        status?: string;
        current_period_end?: string;
        notes?: string;
      }
    }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-system-analytics'] });
      toast.success('Subscription updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update subscription: ' + error.message);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      role 
    }: { 
      userId: string; 
      role: 'owner_admin' | 'client_admin' | 'client_staff'
    }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-user-roles'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user role: ' + error.message);
    },
  });
}
