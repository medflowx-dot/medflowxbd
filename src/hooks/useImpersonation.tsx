import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ImpersonationInfo {
  isImpersonating: boolean;
  adminUserId: string | null;
  sessionId: string | null;
  expiresAt: string | null;
}

export function useImpersonation() {
  const { user } = useAuth();
  const [impersonationInfo, setImpersonationInfo] = useState<ImpersonationInfo>({
    isImpersonating: false,
    adminUserId: null,
    sessionId: null,
    expiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkImpersonation = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if current user has an active impersonation session targeting them
        const { data: sessions, error } = await supabase
          .from('impersonation_sessions')
          .select('*')
          .eq('target_user_id', user.id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking impersonation:', error);
          setIsLoading(false);
          return;
        }

        if (sessions && sessions.length > 0) {
          const session = sessions[0];
          setImpersonationInfo({
            isImpersonating: true,
            adminUserId: session.admin_user_id,
            sessionId: session.id,
            expiresAt: session.expires_at,
          });
        } else {
          setImpersonationInfo({
            isImpersonating: false,
            adminUserId: null,
            sessionId: null,
            expiresAt: null,
          });
        }
      } catch (err) {
        console.error('Error checking impersonation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkImpersonation();

    // Re-check periodically (every minute)
    const interval = setInterval(checkImpersonation, 60000);

    return () => clearInterval(interval);
  }, [user?.id]);

  return { ...impersonationInfo, isLoading };
}
