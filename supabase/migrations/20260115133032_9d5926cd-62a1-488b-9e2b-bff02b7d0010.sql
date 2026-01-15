-- Create feature_flags table for global feature management
CREATE TABLE public.feature_flags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    feature_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    module_type TEXT NOT NULL DEFAULT 'feature', -- 'feature', 'module', 'system'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Owner admins can manage feature flags
CREATE POLICY "Owner admins can manage feature flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner_admin'))
WITH CHECK (public.has_role(auth.uid(), 'owner_admin'));

-- All authenticated users can read feature flags
CREATE POLICY "Authenticated users can read feature flags"
ON public.feature_flags
FOR SELECT
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default feature flags for all pharmacy modules
INSERT INTO public.feature_flags (feature_key, display_name, description, module_type, is_enabled) VALUES
('medicines', 'Medicines', 'Medicine master data management', 'module', true),
('batches', 'Batches', 'Batch and expiry tracking', 'module', true),
('expiry_monitor', 'Expiry Monitor', 'Expiry monitoring dashboard', 'module', true),
('alerts', 'Alerts', 'System alerts and notifications', 'module', true),
('sales', 'Sales', 'Daily sales recording', 'module', true),
('customer_dues', 'Customer Dues', 'Customer due management', 'module', true),
('suppliers', 'Suppliers', 'Supplier management', 'module', true),
('manufacturers', 'Manufacturers', 'Manufacturer management', 'module', true),
('daily_cash', 'Daily Cash', 'Daily cash flow management', 'module', true),
('stock_short', 'Stock Short', 'Stock shortlist and ordering', 'module', true),
('reports', 'Reports', 'Reports and analytics', 'module', true),
('settings', 'Settings', 'User and pharmacy settings', 'module', true);

-- Create payments table for payment tracking
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id),
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BDT',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method TEXT, -- bkash, nagad, card, manual
    transaction_id TEXT,
    gateway_response JSONB,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Owner admins can manage all payments
CREATE POLICY "Owner admins can manage all payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner_admin'))
WITH CHECK (public.has_role(auth.uid(), 'owner_admin'));

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add user preferences columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BDT',
ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS address TEXT;