-- Create subscriptions table for tracking pharmacy subscriptions
CREATE TABLE public.subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'trial' CHECK (plan_type IN ('trial', 'monthly', 'yearly', 'lifetime')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    lifetime_service_due_date TIMESTAMP WITH TIME ZONE,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BDT',
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Owner admins can manage all subscriptions"
ON public.subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Update trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create trial subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, plan_type, status, trial_ends_at, current_period_end)
    VALUES (
        NEW.id, 
        'trial', 
        'active', 
        now() + interval '7 days',
        now() + interval '7 days'
    );
    RETURN NEW;
END;
$$;

-- Create trigger for auto subscription on signup
CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_subscription();

-- Add owner_admin policies to view ALL data across tables
-- Profiles: Owner admin can view all profiles
CREATE POLICY "Owner admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Owner admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Medicines: Owner admin can view all medicines
CREATE POLICY "Owner admins can view all medicines"
ON public.medicines FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Sales: Owner admin can view all sales
CREATE POLICY "Owner admins can view all sales"
ON public.sales FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Customers: Owner admin can view all customers
CREATE POLICY "Owner admins can view all customers"
ON public.customers FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Suppliers: Owner admin can view all suppliers
CREATE POLICY "Owner admins can view all suppliers"
ON public.suppliers FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Medicine batches: Owner admin can view all batches
CREATE POLICY "Owner admins can view all medicine batches"
ON public.medicine_batches FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Supplier purchases: Owner admin can view all purchases
CREATE POLICY "Owner admins can view all supplier purchases"
ON public.supplier_purchases FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Supplier payments: Owner admin can view all supplier payments
CREATE POLICY "Owner admins can view all supplier payments"
ON public.supplier_payments FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Customer payments: Owner admin can view all customer payments
CREATE POLICY "Owner admins can view all customer payments"
ON public.customer_payments FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Sale items: Owner admin can view all sale items
CREATE POLICY "Owner admins can view all sale items"
ON public.sale_items FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));