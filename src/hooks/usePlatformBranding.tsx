import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Default asset paths (fallback to static assets)
const DEFAULT_ASSETS = {
  platform_logo_light: '/src/assets/logo-light.png',
  platform_logo_dark: '/src/assets/logo-dark.png',
  platform_logo_auth: '/src/assets/logo-auth.png',
  platform_favicon: '/favicon.png',
  platform_og_image: '/og-image.png',
  platform_pwa_192: '/pwa-192x192.png',
  platform_pwa_512: '/pwa-512x512.png',
};

interface PlatformBranding {
  logoLight: string;
  logoDark: string;
  logoAuth: string;
  favicon: string;
  ogImage: string;
  pwa192: string;
  pwa512: string;
  isLoading: boolean;
}

export function usePlatformBranding(): PlatformBranding {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['platform-branding'],
    queryFn: async () => {
      const keys = [
        'platform_logo_light',
        'platform_logo_dark',
        'platform_logo_auth',
        'platform_favicon',
        'platform_og_image',
        'platform_pwa_192',
        'platform_pwa_512',
      ];

      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value')
        .in('setting_key', keys);

      if (error) {
        console.error('Error fetching platform branding:', error);
        return {};
      }

      const settingsMap: Record<string, string> = {};
      data?.forEach((s) => {
        if (s.setting_value) {
          // Remove quotes from JSON string values
          const value = String(s.setting_value).replace(/"/g, '');
          if (value && value !== 'null') {
            settingsMap[s.setting_key] = value;
          }
        }
      });

      return settingsMap;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const getValue = (key: keyof typeof DEFAULT_ASSETS): string => {
    return settings?.[key] || DEFAULT_ASSETS[key];
  };

  return {
    logoLight: getValue('platform_logo_light'),
    logoDark: getValue('platform_logo_dark'),
    logoAuth: getValue('platform_logo_auth'),
    favicon: getValue('platform_favicon'),
    ogImage: getValue('platform_og_image'),
    pwa192: getValue('platform_pwa_192'),
    pwa512: getValue('platform_pwa_512'),
    isLoading,
  };
}
