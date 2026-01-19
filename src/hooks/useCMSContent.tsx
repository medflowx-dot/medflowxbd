import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CMSContent {
  id: string;
  section_key: string;
  section_type: string;
  content: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

/**
 * Hook to fetch a single CMS section by key for public display
 * This hook works without authentication - it fetches published content only
 */
export function useCMSContent(sectionKey: string) {
  return useQuery({
    queryKey: ['cms-content', sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .eq('is_visible', true)
        .single();

      if (error) {
        // If no data found, return null instead of throwing
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data as CMSContent;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

/**
 * Hook to fetch all CMS sections for a page
 * Used for rendering the full landing page
 */
export function useAllCMSSections(pageSlug: string = 'homepage') {
  return useQuery({
    queryKey: ['cms-all-sections', pageSlug],
    queryFn: async () => {
      // First get the page
      const { data: page, error: pageError } = await supabase
        .from('cms_pages')
        .select('id')
        .eq('page_slug', pageSlug)
        .eq('is_published', true)
        .single();

      if (pageError || !page) {
        return [];
      }

      // Then get all visible sections for that page
      const { data, error } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as CMSContent[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Helper to get content with fallback
 */
export function getCMSValue<T>(
  cmsContent: CMSContent | null | undefined,
  key: string,
  fallback: T
): T {
  if (!cmsContent?.content) return fallback;
  return (cmsContent.content[key] as T) ?? fallback;
}
