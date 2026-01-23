import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FetchFromMedExResult {
  success: boolean;
  message?: string;
  inserted?: number;
  updated?: number;
  error?: string;
}

export function useFetchFromMedEx() {
  const queryClient = useQueryClient();
  const [lastFetchedTerm, setLastFetchedTerm] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (medicineName: string): Promise<FetchFromMedExResult> => {
      const { data, error } = await supabase.functions.invoke('scrape-medex', {
        body: { medicineName: medicineName.trim() },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, medicineName) => {
      if (data.success) {
        setLastFetchedTerm(medicineName);
        toast.success(
          `MedEx থেকে "${medicineName}" পাওয়া গেছে! (${data.inserted || 0} টি নতুন, ${data.updated || 0} টি আপডেট)`
        );
        // Invalidate queries to refresh the results
        queryClient.invalidateQueries({ queryKey: ['medicine-reference'] });
      } else {
        toast.error(data.error || 'MedEx থেকে তথ্য আনতে ব্যর্থ');
      }
    },
    onError: (error: any) => {
      console.error('MedEx fetch error:', error);
      toast.error(error.message || 'MedEx থেকে তথ্য আনতে ব্যর্থ');
    },
  });

  return {
    fetchFromMedEx: mutation.mutate,
    isFetching: mutation.isPending,
    lastFetchedTerm,
  };
}
