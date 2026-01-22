-- Create customer_prescriptions table for storing regular medications
CREATE TABLE public.customer_prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  notes TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_customer_prescriptions_customer_id ON public.customer_prescriptions(customer_id);
CREATE INDEX idx_customer_prescriptions_user_id ON public.customer_prescriptions(user_id);

-- Enable Row Level Security
ALTER TABLE public.customer_prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view pharmacy customer prescriptions"
ON public.customer_prescriptions
FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'::app_role));

CREATE POLICY "Users can create pharmacy customer prescriptions"
ON public.customer_prescriptions
FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy customer prescriptions"
ON public.customer_prescriptions
FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy customer prescriptions"
ON public.customer_prescriptions
FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Owner admins can view all customer prescriptions"
ON public.customer_prescriptions
FOR SELECT
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_customer_prescriptions_updated_at
BEFORE UPDATE ON public.customer_prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();