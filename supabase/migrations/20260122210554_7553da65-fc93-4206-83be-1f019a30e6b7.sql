-- Drop existing prescription table and recreate with new structure
-- First, drop the old table (it was just created and has no data yet)
DROP TABLE IF EXISTS public.customer_prescriptions;

-- Create prescription parent table
CREATE TABLE public.customer_prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  doctor_name TEXT,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescription medicines child table
CREATE TABLE public.prescription_medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES public.customer_prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.customer_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medicines ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_prescriptions
CREATE POLICY "Users can view their own prescriptions"
ON public.customer_prescriptions FOR SELECT
USING (public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(user_id));

CREATE POLICY "Users can insert their own prescriptions"
ON public.customer_prescriptions FOR INSERT
WITH CHECK (public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(user_id));

CREATE POLICY "Users can update their own prescriptions"
ON public.customer_prescriptions FOR UPDATE
USING (public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(user_id));

CREATE POLICY "Users can delete their own prescriptions"
ON public.customer_prescriptions FOR DELETE
USING (public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(user_id));

-- RLS policies for prescription_medicines (access through parent prescription)
CREATE POLICY "Users can view prescription medicines"
ON public.prescription_medicines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.customer_prescriptions cp
    WHERE cp.id = prescription_id
    AND public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(cp.user_id)
  )
);

CREATE POLICY "Users can insert prescription medicines"
ON public.prescription_medicines FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_prescriptions cp
    WHERE cp.id = prescription_id
    AND public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(cp.user_id)
  )
);

CREATE POLICY "Users can update prescription medicines"
ON public.prescription_medicines FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.customer_prescriptions cp
    WHERE cp.id = prescription_id
    AND public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(cp.user_id)
  )
);

CREATE POLICY "Users can delete prescription medicines"
ON public.prescription_medicines FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.customer_prescriptions cp
    WHERE cp.id = prescription_id
    AND public.get_pharmacy_owner_id(auth.uid()) = public.get_pharmacy_owner_id(cp.user_id)
  )
);

-- Create indexes for better performance
CREATE INDEX idx_customer_prescriptions_customer_id ON public.customer_prescriptions(customer_id);
CREATE INDEX idx_customer_prescriptions_user_id ON public.customer_prescriptions(user_id);
CREATE INDEX idx_prescription_medicines_prescription_id ON public.prescription_medicines(prescription_id);

-- Create triggers for updated_at
CREATE TRIGGER update_customer_prescriptions_updated_at
BEFORE UPDATE ON public.customer_prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescription_medicines_updated_at
BEFORE UPDATE ON public.prescription_medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();