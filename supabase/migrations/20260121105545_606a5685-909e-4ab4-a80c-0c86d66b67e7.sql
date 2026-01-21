-- Create customer_dues table to track individual due entries
CREATE TABLE public.customer_dues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_dues ENABLE ROW LEVEL SECURITY;

-- Create policies (using the correct function signature)
CREATE POLICY "Users can view pharmacy customer dues"
  ON public.customer_dues
  FOR SELECT
  USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'::app_role));

CREATE POLICY "Users can create pharmacy customer dues"
  ON public.customer_dues
  FOR INSERT
  WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy customer dues"
  ON public.customer_dues
  FOR UPDATE
  USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy customer dues"
  ON public.customer_dues
  FOR DELETE
  USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Owner admins can view all customer dues"
  ON public.customer_dues
  FOR SELECT
  USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Create function to recalculate customer total_due
CREATE OR REPLACE FUNCTION public.recalculate_customer_due()
RETURNS TRIGGER AS $$
DECLARE
  total_dues DECIMAL(10,2);
  total_payments DECIMAL(10,2);
  customer_uuid UUID;
BEGIN
  -- Get the customer_id based on operation
  IF TG_OP = 'DELETE' THEN
    customer_uuid := OLD.customer_id;
  ELSE
    customer_uuid := NEW.customer_id;
  END IF;

  -- Calculate total dues
  SELECT COALESCE(SUM(amount), 0) INTO total_dues
  FROM public.customer_dues
  WHERE customer_id = customer_uuid;

  -- Calculate total payments
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM public.customer_payments
  WHERE customer_id = customer_uuid;

  -- Update customer's total_due
  UPDATE public.customers
  SET total_due = total_dues - total_payments, updated_at = now()
  WHERE id = customer_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic recalculation on dues change
CREATE TRIGGER recalculate_due_on_dues_change
  AFTER INSERT OR UPDATE OR DELETE ON public.customer_dues
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_customer_due();

-- Also update payment trigger to use the same function
DROP TRIGGER IF EXISTS update_customer_due_on_payment ON public.customer_payments;
CREATE TRIGGER recalculate_due_on_payment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.customer_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_customer_due();

-- Create indexes for performance
CREATE INDEX idx_customer_dues_customer_id ON public.customer_dues(customer_id);
CREATE INDEX idx_customer_dues_user_id ON public.customer_dues(user_id);