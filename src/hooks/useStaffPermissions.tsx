import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface StaffPermissions {
  id: string;
  staff_user_id: string;
  pharmacy_owner_id: string;
  can_view_medicines: boolean;
  can_manage_medicines: boolean;
  can_view_sales: boolean;
  can_manage_sales: boolean;
  can_view_customer_dues: boolean;
  can_manage_customer_dues: boolean;
  can_view_suppliers: boolean;
  can_manage_suppliers: boolean;
  can_view_manufacturers: boolean;
  can_view_daily_cash: boolean;
  can_manage_daily_cash: boolean;
  can_view_stock_short: boolean;
  can_view_reports: boolean;
  created_at: string;
  updated_at: string;
}

export const defaultStaffPermissions: Omit<StaffPermissions, 'id' | 'staff_user_id' | 'pharmacy_owner_id' | 'created_at' | 'updated_at'> = {
  can_view_medicines: true,
  can_manage_medicines: false,
  can_view_sales: true,
  can_manage_sales: true,
  can_view_customer_dues: true,
  can_manage_customer_dues: false,
  can_view_suppliers: false,
  can_manage_suppliers: false,
  can_view_manufacturers: false,
  can_view_daily_cash: true,
  can_manage_daily_cash: true,
  can_view_stock_short: false,
  can_view_reports: false,
};

// Fetch permissions for a specific staff member
export function useStaffPermissions(staffUserId: string | undefined) {
  return useQuery({
    queryKey: ['staff-permissions', staffUserId],
    queryFn: async () => {
      if (!staffUserId) return null;
      
      const { data, error } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('staff_user_id', staffUserId)
        .maybeSingle();

      if (error) throw error;
      return data as StaffPermissions | null;
    },
    enabled: !!staffUserId,
  });
}

// Fetch current user's own permissions (for staff members)
export function useMyPermissions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('staff_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as StaffPermissions | null;
    },
    enabled: !!user?.id,
  });
}

// Update or create staff permissions
export function useUpdateStaffPermissions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      staffUserId, 
      permissions 
    }: { 
      staffUserId: string; 
      permissions: Partial<Omit<StaffPermissions, 'id' | 'staff_user_id' | 'pharmacy_owner_id' | 'created_at' | 'updated_at'>> 
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if permissions exist
      const { data: existing } = await supabase
        .from('staff_permissions')
        .select('id')
        .eq('staff_user_id', staffUserId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('staff_permissions')
          .update(permissions)
          .eq('staff_user_id', staffUserId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('staff_permissions')
          .insert({
            staff_user_id: staffUserId,
            pharmacy_owner_id: user.id,
            ...defaultStaffPermissions,
            ...permissions,
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff-permissions', variables.staffUserId] });
      queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
      toast.success('Permissions updated successfully');
    },
    onError: (error) => {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    },
  });
}

// Create default permissions for new staff
export function useCreateDefaultPermissions() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (staffUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('staff_permissions')
        .insert({
          staff_user_id: staffUserId,
          pharmacy_owner_id: user.id,
          ...defaultStaffPermissions,
        });

      if (error && !error.message.includes('duplicate')) throw error;
    },
  });
}
