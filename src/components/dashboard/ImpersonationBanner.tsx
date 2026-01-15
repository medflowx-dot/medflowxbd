import { useState } from 'react';
import { useImpersonation } from '@/hooks/useImpersonation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function ImpersonationBanner() {
  const { isImpersonating, expiresAt, sessionId } = useImpersonation();
  const { signOut } = useAuth();
  const [isEnding, setIsEnding] = useState(false);

  const handleEndSession = async () => {
    setIsEnding(true);
    try {
      // Sign out the impersonated session
      await signOut();
      toast.success('Impersonation session ended. Returning to login.');
    } catch (error) {
      toast.error('Failed to end session');
    } finally {
      setIsEnding(false);
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-4 py-2.5 shadow-lg">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-bold">IMPERSONATION MODE</span>
          </div>
          <span className="text-sm">
            You are viewing this account as an admin. All actions are logged.
          </span>
          {expiresAt && (
            <span className="text-xs opacity-80 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires: {format(new Date(expiresAt), 'HH:mm')}
            </span>
          )}
        </div>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={handleEndSession}
          disabled={isEnding}
          className="bg-white text-orange-600 hover:bg-white/90 font-medium"
        >
          {isEnding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          End Session
        </Button>
      </div>
    </div>
  );
}
