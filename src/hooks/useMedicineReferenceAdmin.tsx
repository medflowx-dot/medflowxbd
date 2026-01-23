import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// MedEx-style complete medicine reference data
export interface MedicineReferenceData {
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

export interface CreateMedicineReferenceData {
  name: string;
  generic_name?: string;
  dosage_form?: string;
  strength?: string;
  manufacturer_name?: string;
  unit_price?: number;
  strip_price?: number;
  pack_size?: string;
  indication?: string;
  drug_class?: string;
  // MedEx-style clinical fields
  pharmacology?: string;
  mode_of_action?: string;
  dosage_adult?: string;
  dosage_pediatric?: string;
  administration?: string;
  contraindications?: string;
  side_effects?: string;
  precautions?: string;
  drug_interactions?: string;
  overdose_info?: string;
  pregnancy_category?: string;
  lactation_info?: string;
  storage?: string;
  therapeutic_class?: string;
}

export interface UpdateMedicineReferenceData extends CreateMedicineReferenceData {
  id: string;
}

export function useMedicineReferenceAdmin(options: { search?: string; limit?: number } = {}) {
  const { search = '', limit = 100 } = options;
  const queryClient = useQueryClient();

  const medicinesQuery = useQuery({
    queryKey: ['medicine-reference-admin', search, limit],
    queryFn: async () => {
      let query = supabase
        .from('medicine_reference' as any)
        .select('*')
        .eq('is_active', true)
        .order('name')
        .limit(limit);

      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,generic_name.ilike.%${search}%,manufacturer_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as MedicineReferenceData[];
    },
  });

  const createMedicine = useMutation({
    mutationFn: async (data: CreateMedicineReferenceData) => {
      const { data: result, error } = await supabase
        .from('medicine_reference' as any)
        .insert({
          name: data.name,
          generic_name: data.generic_name || null,
          dosage_form: data.dosage_form || null,
          strength: data.strength || null,
          manufacturer_name: data.manufacturer_name || null,
          unit_price: data.unit_price || null,
          strip_price: data.strip_price || null,
          pack_size: data.pack_size || null,
          indication: data.indication || null,
          drug_class: data.drug_class || null,
          // Clinical fields
          pharmacology: data.pharmacology || null,
          mode_of_action: data.mode_of_action || null,
          dosage_adult: data.dosage_adult || null,
          dosage_pediatric: data.dosage_pediatric || null,
          administration: data.administration || null,
          contraindications: data.contraindications || null,
          side_effects: data.side_effects || null,
          precautions: data.precautions || null,
          drug_interactions: data.drug_interactions || null,
          overdose_info: data.overdose_info || null,
          pregnancy_category: data.pregnancy_category || null,
          lactation_info: data.lactation_info || null,
          storage: data.storage || null,
          therapeutic_class: data.therapeutic_class || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicine-reference-admin'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-reference'] });
      toast.success('Medicine added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add medicine');
    },
  });

  const updateMedicine = useMutation({
    mutationFn: async (data: UpdateMedicineReferenceData) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('medicine_reference' as any)
        .update({
          name: updateData.name,
          generic_name: updateData.generic_name || null,
          dosage_form: updateData.dosage_form || null,
          strength: updateData.strength || null,
          manufacturer_name: updateData.manufacturer_name || null,
          unit_price: updateData.unit_price || null,
          strip_price: updateData.strip_price || null,
          pack_size: updateData.pack_size || null,
          indication: updateData.indication || null,
          drug_class: updateData.drug_class || null,
          // Clinical fields
          pharmacology: updateData.pharmacology || null,
          mode_of_action: updateData.mode_of_action || null,
          dosage_adult: updateData.dosage_adult || null,
          dosage_pediatric: updateData.dosage_pediatric || null,
          administration: updateData.administration || null,
          contraindications: updateData.contraindications || null,
          side_effects: updateData.side_effects || null,
          precautions: updateData.precautions || null,
          drug_interactions: updateData.drug_interactions || null,
          overdose_info: updateData.overdose_info || null,
          pregnancy_category: updateData.pregnancy_category || null,
          lactation_info: updateData.lactation_info || null,
          storage: updateData.storage || null,
          therapeutic_class: updateData.therapeutic_class || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicine-reference-admin'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-reference'] });
      toast.success('Medicine updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update medicine');
    },
  });

  const deleteMedicine = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active = false
      const { error } = await supabase
        .from('medicine_reference' as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicine-reference-admin'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-reference'] });
      toast.success('Medicine deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete medicine');
    },
  });

  const bulkCreate = useMutation({
    mutationFn: async (medicines: CreateMedicineReferenceData[]) => {
      const insertData = medicines.map((med) => ({
        name: med.name,
        generic_name: med.generic_name || null,
        dosage_form: med.dosage_form || null,
        strength: med.strength || null,
        manufacturer_name: med.manufacturer_name || null,
        unit_price: med.unit_price || null,
        strip_price: med.strip_price || null,
        pack_size: med.pack_size || null,
        indication: med.indication || null,
        drug_class: med.drug_class || null,
        // Clinical fields
        pharmacology: med.pharmacology || null,
        mode_of_action: med.mode_of_action || null,
        dosage_adult: med.dosage_adult || null,
        dosage_pediatric: med.dosage_pediatric || null,
        administration: med.administration || null,
        contraindications: med.contraindications || null,
        side_effects: med.side_effects || null,
        precautions: med.precautions || null,
        drug_interactions: med.drug_interactions || null,
        overdose_info: med.overdose_info || null,
        pregnancy_category: med.pregnancy_category || null,
        lactation_info: med.lactation_info || null,
        storage: med.storage || null,
        therapeutic_class: med.therapeutic_class || null,
        is_active: true,
      }));

      const { error } = await supabase
        .from('medicine_reference' as any)
        .insert(insertData);

      if (error) throw error;
      return { inserted: insertData.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medicine-reference-admin'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-reference'] });
      toast.success(`${data.inserted} medicines imported successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import medicines');
    },
  });

  return {
    medicines: medicinesQuery.data || [],
    isLoading: medicinesQuery.isLoading,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    bulkCreate,
  };
}
