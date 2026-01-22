import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Prefetch common dashboard routes after initial load
const PREFETCH_ROUTES = [
  () => import('@/pages/dashboard/DashboardHome'),
  () => import('@/pages/dashboard/Sales'),
  () => import('@/pages/dashboard/Medicines'),
  () => import('@/pages/dashboard/DailyCash'),
];

/**
 * Prefetches common routes after the app has loaded
 * to make subsequent navigation instant
 */
export function usePrefetchRoutes() {
  const location = useLocation();

  const prefetchRoutes = useCallback(() => {
    // Only prefetch after user has navigated to dashboard
    if (location.pathname.startsWith('/dashboard')) {
      // Use requestIdleCallback for non-blocking prefetch
      const prefetch = () => {
        PREFETCH_ROUTES.forEach((importFn) => {
          importFn().catch(() => {
            // Silently fail - prefetch is optional
          });
        });
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetch, { timeout: 3000 });
      } else {
        setTimeout(prefetch, 1000);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    prefetchRoutes();
  }, [prefetchRoutes]);
}

/**
 * Hook to lazy load images only when they enter viewport
 */
export function useLazyImages() {
  useEffect(() => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );

      document.querySelectorAll('img[data-src]').forEach((img) => {
        observer.observe(img);
      });

      return () => observer.disconnect();
    }
  }, []);
}
