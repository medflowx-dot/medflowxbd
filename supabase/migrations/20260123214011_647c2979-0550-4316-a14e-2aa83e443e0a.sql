-- Add MedEx-style detailed clinical fields to medicine_reference table
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS pharmacology TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS mode_of_action TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS dosage_adult TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS dosage_pediatric TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS administration TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS contraindications TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS side_effects TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS precautions TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS drug_interactions TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS overdose_info TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS pregnancy_category TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS lactation_info TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS storage TEXT;
ALTER TABLE medicine_reference ADD COLUMN IF NOT EXISTS therapeutic_class TEXT;