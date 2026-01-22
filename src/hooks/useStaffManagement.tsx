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
      if (!profile?.pharmacy_name) {
        console.log('usePharmacyStaff: No pharmacy_name found');
        return [];
      }

      console.log('usePharmacyStaff: Fetching staff for pharmacy:', profile.pharmacy_name);
      console.log('usePharmacyStaff: Current user ID:', user?.id);

      // Get all profiles with the same pharmacy name
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('pharmacy_name', profile.pharmacy_name);

      if (profilesError) {
        console.error('usePharmacyStaff: Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('usePharmacyStaff: Found profiles:', profiles);

      if (!profiles || profiles.length === 0) {
        console.log('usePharmacyStaff: No profiles found for this pharmacy');
        return [];
      }

      // Get roles for these users
      const userIds = profiles.map(p => p.user_id);
      console.log('usePharmacyStaff: Fetching roles for user IDs:', userIds);
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (rolesError) {
        console.error('usePharmacyStaff: Error fetching roles:', rolesError);
        throw rolesError;
      }

      console.log('usePharmacyStaff: Found roles:', roles);

      // Combine and filter to only show staff (not the admin themselves)
      const staffMembers: StaffMember[] = profiles
        .filter(p => p.user_id !== user?.id) // Exclude current user
        .map(p => {
          const userRole = roles?.find(r => r.user_id === p.user_id);
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

      console.log('usePharmacyStaff: Final staff members:', staffMembers);

      return staffMembers;
    },
    enabled: !!profile?.pharmacy_name,
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ invite_method, email, phone, fullName }: { 
      invite_method: 'email' | 'phone';
      email?: string; 
      phone?: string;
      fullName: string;
    }) => {
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
            invite_method,
            email: invite_method === 'email' ? email : undefined,
            phone: invite_method === 'phone' ? phone : undefined,
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
      if (data.credentials_sent) {
        const method = data.invite_method === 'email' ? 'ইমেইল' : 'SMS';
        toast.success('স্টাফ সফলভাবে ইনভাইট হয়েছে!', {
          description: `লগইন ক্রেডেনশিয়াল ${method} এ পাঠানো হয়েছে।`,
          duration: 5000,
        });
      } else {
        toast.success('স্টাফ তৈরি হয়েছে!', {
          description: `টেম্পরারি পাসওয়ার্ড: ${data.temp_password}`,
          duration: 15000,
        });
      }
    },
    onError: (error) => {
      toast.error('স্টাফ ইনভাইট ব্যর্থ: ' + error.message);
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

export function useResetStaffPassword() {
  return useMutation({
    mutationFn: async (staffUserId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://pjowmwyaribfewhbaazl.supabase.co/functions/v1/reset-staff-password`,
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
        throw new Error(result.error || 'Failed to reset password');
      }

      return result;
    },
    onSuccess: (data) => {
      if (data.email_sent) {
        toast.success('Password reset successfully!', {
          description: 'New credentials have been sent via email.',
          duration: 5000,
        });
      } else {
        toast.success('Password reset successfully!', {
          description: `New password: ${data.new_password}`,
          duration: 15000,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to reset password: ' + error.message);
    },
  });
}
