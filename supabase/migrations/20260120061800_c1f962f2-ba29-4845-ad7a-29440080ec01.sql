-- Payment Requests Table for manual payment verification
CREATE TABLE public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.pricing_plans(id),
  plan_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL, -- bkash, nagad, bank
  transaction_id TEXT NOT NULL,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own payment requests" 
ON public.payment_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create payment requests" 
ON public.payment_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Owner admin can view all requests
CREATE POLICY "Owner admin can view all payment requests" 
ON public.payment_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Owner admin can update requests (for verification)
CREATE POLICY "Owner admin can update payment requests" 
ON public.payment_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Add updated_at trigger
CREATE TRIGGER update_payment_requests_updated_at
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX idx_payment_requests_user_id ON public.payment_requests(user_id);