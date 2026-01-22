import { usePrefetchRoutes } from "@/hooks/usePerformance";

/**
 * Component that handles route prefetching
 * Must be inside BrowserRouter
 */
export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  usePrefetchRoutes();
  return <>{children}</>;
}
