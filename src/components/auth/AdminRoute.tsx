import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { BrandedLoader } from '@/components/ui/branded-loader';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that restricts access to admin-only routes.
 * Redirects client_staff users to the dashboard.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return <BrandedLoader />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
