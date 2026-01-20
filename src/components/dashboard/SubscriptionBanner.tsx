import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SubscriptionBanner() {
  const navigate = useNavigate();
  const { isTrial, daysRemaining, planType, isOwnerAdmin, isLoading } = useSubscriptionStatus();

  if (isLoading || isOwnerAdmin) return null;

  // Show warning for trial users with less than 3 days remaining
  if (isTrial && daysRemaining !== null && daysRemaining <= 3) {
    return (
      <div className="bg-warning text-warning-foreground px-4 py-2">
        <div className="container max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Trial expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}!
            </span>
          </div>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => navigate('/billing')}
            className="bg-white text-warning hover:bg-white/90"
          >
            <Crown className="h-3 w-3 mr-1" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  // Show trial badge for trial users
  if (isTrial && daysRemaining !== null) {
    return (
      <div className="bg-info text-info-foreground px-4 py-1.5">
        <div className="container max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              Free Trial: {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
            </span>
          </div>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => navigate('/billing')}
            className="bg-white/20 hover:bg-white/30 text-info-foreground text-xs py-1 h-auto"
          >
            View Plans
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
