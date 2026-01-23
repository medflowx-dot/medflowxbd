import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// MedEx-style complete medicine reference interface
export interface MedicineReference {
  id: string;
  name: string;
  generic_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  manufacturer_name: string | null;
  unit_price: number | null;
  strip_price: number | null;
  pack_size: string | null;
  indication: string | null;
  drug_class: string | null;
  // MedEx-style clinical fields
  pharmacology: string | null;
  mode_of_action: string | null;
  dosage_adult: string | null;
  dosage_pediatric: string | null;
  administration: string | null;
  contraindications: string | null;
  side_effects: string | null;
  precautions: string | null;
  drug_interactions: string | null;
  overdose_info: string | null;
  pregnancy_category: string | null;
  lactation_info: string | null;
  storage: string | null;
  therapeutic_class: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicineGeneric {
  id: string;
  name: string;
  description: string | null;
  drug_class: string | null;
  created_at: string;
  updated_at: string;
}

interface UseMedicineReferenceOptions {
  search?: string;
  dosageForm?: string;
  drugClass?: string;
  manufacturer?: string;
  genericName?: string;
  limit?: number;
}

export function useMedicineReference(options: UseMedicineReferenceOptions = {}) {
  const { search = '', dosageForm, drugClass, manufacturer, genericName, limit = 50 } = options;

  return useQuery({
    queryKey: ['medicine-reference', search, dosageForm, drugClass, manufacturer, genericName, limit],
    queryFn: async () => {
      let query = supabase
        .from('medicine_reference' as any)
        .select('*')
        .eq('is_active', true)
        .order('name')
        .limit(limit);

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%`);
      }

      if (dosageForm && dosageForm !== 'all') {
        query = query.eq('dosage_form', dosageForm);
      }

      if (drugClass && drugClass !== 'all') {
        query = query.eq('drug_class', drugClass);
      }

      if (manufacturer && manufacturer !== 'all') {
        query = query.eq('manufacturer_name', manufacturer);
      }

      if (genericName) {
        query = query.eq('generic_name', genericName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as MedicineReference[];
    },
    enabled: true,
  });
}

export function useMedicineReferenceById(id: string | null) {
  return useQuery({
    queryKey: ['medicine-reference', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('medicine_reference' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as MedicineReference;
    },
    enabled: !!id,
  });
}

export function useAlternateBrands(genericName: string | null, currentMedicineId?: string) {
  return useQuery({
    queryKey: ['alternate-brands', genericName, currentMedicineId],
    queryFn: async () => {
      if (!genericName) return [];

      let query = supabase
        .from('medicine_reference' as any)
        .select('*')
        .eq('generic_name', genericName)
        .eq('is_active', true)
        .order('unit_price', { ascending: true, nullsFirst: false });

      if (currentMedicineId) {
        query = query.neq('id', currentMedicineId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as MedicineReference[];
    },
    enabled: !!genericName,
  });
}

export function useMedicineReferenceFilters() {
  // Fetch unique dosage forms
  const dosageFormsQuery = useQuery({
    queryKey: ['medicine-reference-dosage-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_reference' as any)
        .select('dosage_form')
        .eq('is_active', true)
        .not('dosage_form', 'is', null);

      if (error) throw error;

      const items = (data || []) as unknown as { dosage_form: string }[];
      const uniqueForms = [...new Set(items.map(d => d.dosage_form).filter(Boolean))];
      return uniqueForms.sort();
    },
  });

  // Fetch unique drug classes
  const drugClassesQuery = useQuery({
    queryKey: ['medicine-reference-drug-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_reference' as any)
        .select('drug_class')
        .eq('is_active', true)
        .not('drug_class', 'is', null);

      if (error) throw error;

      const items = (data || []) as unknown as { drug_class: string }[];
      const uniqueClasses = [...new Set(items.map(d => d.drug_class).filter(Boolean))];
      return uniqueClasses.sort();
    },
  });

  // Fetch unique manufacturers
  const manufacturersQuery = useQuery({
    queryKey: ['medicine-reference-manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine_reference' as any)
        .select('manufacturer_name')
        .eq('is_active', true)
        .not('manufacturer_name', 'is', null);

      if (error) throw error;

      const items = (data || []) as unknown as { manufacturer_name: string }[];
      const uniqueMfgs = [...new Set(items.map(d => d.manufacturer_name).filter(Boolean))];
      return uniqueMfgs.sort();
    },
  });

  return {
    dosageForms: dosageFormsQuery.data || [],
    drugClasses: drugClassesQuery.data || [],
    manufacturers: manufacturersQuery.data || [],
    isLoading: dosageFormsQuery.isLoading || drugClassesQuery.isLoading || manufacturersQuery.isLoading,
  };
}

export function useMedicineReferenceStats() {
  return useQuery({
    queryKey: ['medicine-reference-stats'],
    queryFn: async () => {
      const { count: totalCount, error: countError } = await supabase
        .from('medicine_reference' as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (countError) throw countError;

      const { data: genericData, error: genericError } = await supabase
        .from('medicine_reference' as any)
        .select('generic_name')
        .eq('is_active', true)
        .not('generic_name', 'is', null);

      if (genericError) throw genericError;

      const genericItems = (genericData || []) as unknown as { generic_name: string }[];
      const uniqueGenerics = new Set(genericItems.map(d => d.generic_name));

      const { data: mfgData, error: mfgError } = await supabase
        .from('medicine_reference' as any)
        .select('manufacturer_name')
        .eq('is_active', true)
        .not('manufacturer_name', 'is', null);

      if (mfgError) throw mfgError;

      const mfgItems = (mfgData || []) as unknown as { manufacturer_name: string }[];
      const uniqueMfgs = new Set(mfgItems.map(d => d.manufacturer_name));

      return {
        totalMedicines: totalCount || 0,
        totalGenerics: uniqueGenerics.size,
        totalManufacturers: uniqueMfgs.size,
      };
    },
  });
}

// For same medicine in different forms (Tablet, Syrup, Injection)
export function useAvailableForms(genericName: string | null, currentForm?: string) {
  return useQuery({
    queryKey: ['available-forms', genericName, currentForm],
    queryFn: async () => {
      if (!genericName) return [];

      const { data, error } = await supabase
        .from('medicine_reference' as any)
        .select('id, name, dosage_form, strength')
        .eq('generic_name', genericName)
        .eq('is_active', true)
        .order('dosage_form');

      if (error) throw error;

      type FormItem = { id: string; name: string; dosage_form: string | null; strength: string | null };
      const items = (data || []) as unknown as FormItem[];

      // Group by dosage form
      const formMap = new Map<string, { id: string; name: string; strength: string }[]>();
      items.forEach(med => {
        if (med.dosage_form) {
          if (!formMap.has(med.dosage_form)) {
            formMap.set(med.dosage_form, []);
          }
          formMap.get(med.dosage_form)?.push({
            id: med.id,
            name: med.name,
            strength: med.strength || '',
          });
        }
      });

      return Array.from(formMap.entries()).map(([form, medicines]) => ({
        form,
        medicines,
      }));
    },
    enabled: !!genericName,
  });
}
