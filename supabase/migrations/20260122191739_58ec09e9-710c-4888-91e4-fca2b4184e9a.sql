-- Create medicine_generics table for generic master data
CREATE TABLE public.medicine_generics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  drug_class TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicine_reference table for MedEx-like data
CREATE TABLE public.medicine_reference (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage_form TEXT,
  strength TEXT,
  manufacturer_name TEXT,
  unit_price NUMERIC(10, 2),
  strip_price NUMERIC(10, 2),
  pack_size TEXT,
  indication TEXT,
  drug_class TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better search performance
CREATE INDEX idx_medicine_reference_name ON public.medicine_reference USING gin(to_tsvector('simple', name));
CREATE INDEX idx_medicine_reference_generic ON public.medicine_reference(generic_name);
CREATE INDEX idx_medicine_reference_manufacturer ON public.medicine_reference(manufacturer_name);
CREATE INDEX idx_medicine_reference_dosage_form ON public.medicine_reference(dosage_form);
CREATE INDEX idx_medicine_reference_drug_class ON public.medicine_reference(drug_class);
CREATE INDEX idx_medicine_generics_name ON public.medicine_generics(name);

-- Enable RLS
ALTER TABLE public.medicine_generics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_reference ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medicine_generics
CREATE POLICY "Authenticated users can view generics"
ON public.medicine_generics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Owner admin can manage generics"
ON public.medicine_generics
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner_admin'))
WITH CHECK (public.has_role(auth.uid(), 'owner_admin'));

-- RLS Policies for medicine_reference
CREATE POLICY "Authenticated users can view medicine reference"
ON public.medicine_reference
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Owner admin can manage medicine reference"
ON public.medicine_reference
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner_admin'))
WITH CHECK (public.has_role(auth.uid(), 'owner_admin'));

-- Add feature flag for medicine reference
INSERT INTO public.feature_flags (feature_key, display_name, description, is_enabled, module_type)
VALUES ('medicine_reference', 'Medicine Reference', 'MedEx-style medicine price and information lookup', true, 'reference')
ON CONFLICT (feature_key) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_medicine_generics_updated_at
BEFORE UPDATE ON public.medicine_generics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_reference_updated_at
BEFORE UPDATE ON public.medicine_reference
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();