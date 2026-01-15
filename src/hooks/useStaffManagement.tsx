import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

export interface StaffMember {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  pharmacy_name: string | null;
  created_at: string;
  role: string;
}

export function usePharmacyStaff() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['pharmacy-staff', profile?.pharmacy_name],
    queryFn: async () => {
      if (!profile?.pharmacy_name) return [];

      // Get all profiles with the same pharmacy name
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('pharmacy_name', profile.pharmacy_name);

      if (profilesError) throw profilesError;

      // Get roles for these users
      const userIds = profiles.map(p => p.user_id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combine and filter to only show staff (not the admin themselves)
      const staffMembers: StaffMember[] = profiles
        .filter(p => p.user_id !== user?.id) // Exclude current user
        .map(p => {
          const userRole = roles.find(r => r.user_id === p.user_id);
          return {
            id: p.id,
            user_id: p.user_id,
            full_name: p.full_name,
            phone: p.phone,
            pharmacy_name: p.pharmacy_name,
            created_at: p.created_at,
            role: userRole?.role || 'client_staff',
          };
        })
        .filter(s => s.role === 'client_staff'); // Only show staff, not other admins

      return staffMembers;
    },
    enabled: !!profile?.pharmacy_name,
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ email, fullName }: { email: string; fullName: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://pjowmwyaribfewhbaazl.supabase.co/functions/v1/invite-staff`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            full_name: fullName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite staff');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-staff', profile?.pharmacy_name] });
      if (data.email_sent) {
        toast.success('Staff member invited successfully!', {
          description: 'Login credentials have been sent via email.',
          duration: 5000,
        });
      } else {
        toast.success('Staff member created successfully!', {
          description: `Please share this temporary password: ${data.temp_password}`,
          duration: 15000,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to invite staff: ' + error.message);
    },
  });
}

export function useRemoveStaff() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (staffUserId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://pjowmwyaribfewhbaazl.supabase.co/functions/v1/remove-staff`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            staff_user_id: staffUserId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove staff');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy-staff', profile?.pharmacy_name] });
      toast.success('Staff member removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove staff: ' + error.message);
    },
  });
}
