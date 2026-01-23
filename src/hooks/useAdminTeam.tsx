import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type AdminTeamRole = 'manager' | 'support' | 'staff' | 'technical_it';

export interface AdminTeamMember {
  id: string;
  user_id: string;
  team_role: AdminTeamRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminTeamPermissions {
  id: string;
  team_member_id: string;
  can_view_dashboard: boolean;
  can_view_clients: boolean;
  can_manage_clients: boolean;
  can_delete_clients: boolean;
  can_view_subscriptions: boolean;
  can_manage_subscriptions: boolean;
  can_view_payments: boolean;
  can_manage_payments: boolean;
  can_process_refunds: boolean;
  can_view_pricing: boolean;
  can_manage_pricing: boolean;
  can_view_master_data: boolean;
  can_manage_master_data: boolean;
  can_view_settings: boolean;
  can_manage_settings: boolean;
  can_view_audit_logs: boolean;
  can_view_feature_flags: boolean;
  can_manage_feature_flags: boolean;
  can_view_cms: boolean;
  can_manage_cms: boolean;
  can_view_email_templates: boolean;
  can_manage_email_templates: boolean;
  can_send_notifications: boolean;
  can_impersonate_users: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminTeamMemberWithPermissions extends AdminTeamMember {
  admin_team_permissions: AdminTeamPermissions | null;
}

export const defaultAdminPermissions: Omit<AdminTeamPermissions, 'id' | 'team_member_id' | 'created_at' | 'updated_at'> = {
  can_view_dashboard: true,
  can_view_clients: false,
  can_manage_clients: false,
  can_delete_clients: false,
  can_view_subscriptions: false,
  can_manage_subscriptions: false,
  can_view_payments: false,
  can_manage_payments: false,
  can_process_refunds: false,
  can_view_pricing: false,
  can_manage_pricing: false,
  can_view_master_data: false,
  can_manage_master_data: false,
  can_view_settings: false,
  can_manage_settings: false,
  can_view_audit_logs: false,
  can_view_feature_flags: false,
  can_manage_feature_flags: false,
  can_view_cms: false,
  can_manage_cms: false,
  can_view_email_templates: false,
  can_manage_email_templates: false,
  can_send_notifications: false,
  can_impersonate_users: false,
};

// Fetch all admin team members
export function useAdminTeamMembers() {
  return useQuery({
    queryKey: ['admin-team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_team_members')
        .select('*, admin_team_permissions(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminTeamMemberWithPermissions[];
    },
  });
}

// Check if current user is an admin team member and get their permissions
export function useMyAdminTeamPermissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-admin-team-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('admin_team_members')
        .select('*, admin_team_permissions(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as AdminTeamMemberWithPermissions | null;
    },
    enabled: !!user?.id,
  });
}

// Get permissions for a specific team member
export function useAdminTeamMemberPermissions(teamMemberId: string | undefined) {
  return useQuery({
    queryKey: ['admin-team-member-permissions', teamMemberId],
    queryFn: async () => {
      if (!teamMemberId) return null;

      const { data, error } = await supabase
        .from('admin_team_permissions')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .maybeSingle();

      if (error) throw error;
      return data as AdminTeamPermissions | null;
    },
    enabled: !!teamMemberId,
  });
}

// Invite a new admin team member
export function useInviteAdminTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      full_name: string;
      email: string;
      team_role: AdminTeamRole;
      permissions?: Partial<AdminTeamPermissions>;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('invite-admin-team', {
        body: data,
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Invite করতে সমস্যা হয়েছে');
      }

      const result = response.data;
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      toast.success(data.message);
      
      // Show temporary password if email wasn't sent
      if (data.tempPassword) {
        toast.info(`Temporary Password: ${data.tempPassword}`, { duration: 10000 });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update admin team member permissions
export function useUpdateAdminTeamPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      teamMemberId, 
      permissions 
    }: { 
      teamMemberId: string; 
      permissions: Partial<AdminTeamPermissions>;
    }) => {
      const { error } = await supabase
        .from('admin_team_permissions')
        .update(permissions)
        .eq('team_member_id', teamMemberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['admin-team-member-permissions'] });
      toast.success('Permissions আপডেট করা হয়েছে');
    },
    onError: () => {
      toast.error('Permissions আপডেট করতে সমস্যা হয়েছে');
    },
  });
}

// Update admin team member details
export function useUpdateAdminTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      teamMemberId, 
      data 
    }: { 
      teamMemberId: string; 
      data: Partial<AdminTeamMember>;
    }) => {
      const { error } = await supabase
        .from('admin_team_members')
        .update(data)
        .eq('id', teamMemberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      toast.success('Team member আপডেট করা হয়েছে');
    },
    onError: () => {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    },
  });
}

// Remove admin team member
export function useRemoveAdminTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamMemberId, deleteUser }: { teamMemberId: string; deleteUser?: boolean }) => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('remove-admin-team', {
        body: { team_member_id: teamMemberId, delete_user: deleteUser },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'মুছতে সমস্যা হয়েছে');
      }

      const result = response.data;
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Toggle member active status
export function useToggleAdminTeamStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamMemberId, isActive }: { teamMemberId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('admin_team_members')
        .update({ is_active: isActive })
        .eq('id', teamMemberId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      toast.success(variables.isActive ? 'Member সক্রিয় করা হয়েছে' : 'Member নিষ্ক্রিয় করা হয়েছে');
    },
    onError: () => {
      toast.error('Status পরিবর্তন করতে সমস্যা হয়েছে');
    },
  });
}

// Role label helpers
export const roleLabels: Record<AdminTeamRole, { en: string; bn: string }> = {
  manager: { en: 'Manager', bn: 'ম্যানেজার' },
  support: { en: 'Support', bn: 'সাপোর্ট' },
  staff: { en: 'Staff', bn: 'স্টাফ' },
  technical_it: { en: 'Technical IT', bn: 'টেকনিক্যাল আইটি' },
};

export function getRoleLabel(role: AdminTeamRole, language: 'en' | 'bn' = 'en'): string {
  return roleLabels[role]?.[language] || role;
}
