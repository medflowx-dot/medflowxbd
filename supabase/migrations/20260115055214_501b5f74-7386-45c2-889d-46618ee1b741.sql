-- Create daily_costs table for expense tracking
CREATE TABLE public.daily_costs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opening_cash table for manual opening balance entries
CREATE TABLE public.opening_cash (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    cash_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, cash_date)
);

-- Create indexes
CREATE INDEX idx_daily_costs_user_date ON public.daily_costs(user_id, cost_date);
CREATE INDEX idx_opening_cash_user_date ON public.opening_cash(user_id, cash_date);

-- Enable RLS
ALTER TABLE public.daily_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_cash ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_costs
CREATE POLICY "Users can view their own costs"
ON public.daily_costs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own costs"
ON public.daily_costs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own costs"
ON public.daily_costs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own costs"
ON public.daily_costs FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Owner admins can view all costs"
ON public.daily_costs FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- RLS policies for opening_cash
CREATE POLICY "Users can view their own opening cash"
ON public.opening_cash FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own opening cash"
ON public.opening_cash FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opening cash"
ON public.opening_cash FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opening cash"
ON public.opening_cash FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Owner admins can view all opening cash"
ON public.opening_cash FOR SELECT
USING (public.has_role(auth.uid(), 'owner_admin'));

-- Update triggers
CREATE TRIGGER update_daily_costs_updated_at
    BEFORE UPDATE ON public.daily_costs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opening_cash_updated_at
    BEFORE UPDATE ON public.opening_cash
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();