import { Navigate, useLocation } from 'react-router-dom';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const location = useLocation();
  const { isActive, isExpired, isSuspended, isLoading, isOwnerAdmin } = useSubscriptionStatus();

  // Show loader while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Owner admin always bypasses subscription checks
  if (isOwnerAdmin) {
    return <>{children}</>;
  }

  // If subscription is expired or suspended, redirect to billing
  if (isExpired || isSuspended || !isActive) {
    return <Navigate to="/billing" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
