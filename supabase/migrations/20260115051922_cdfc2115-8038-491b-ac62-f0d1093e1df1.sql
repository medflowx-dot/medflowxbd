-- Create suppliers table
CREATE TABLE public.suppliers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    contact_person TEXT,
    notes TEXT,
    total_due NUMERIC NOT NULL DEFAULT 0,
    total_paid NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_payments table for tracking payments to suppliers
CREATE TABLE public.supplier_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_purchases table for tracking purchases from suppliers
CREATE TABLE public.supplier_purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    invoice_number TEXT,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    due_amount NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_purchases ENABLE ROW LEVEL SECURITY;

-- Suppliers RLS policies
CREATE POLICY "Users can view their own suppliers" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);

-- Supplier payments RLS policies
CREATE POLICY "Users can view their own supplier payments" ON public.supplier_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own supplier payments" ON public.supplier_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own supplier payments" ON public.supplier_payments FOR DELETE USING (auth.uid() = user_id);

-- Supplier purchases RLS policies
CREATE POLICY "Users can view their own supplier purchases" ON public.supplier_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own supplier purchases" ON public.supplier_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own supplier purchases" ON public.supplier_purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own supplier purchases" ON public.supplier_purchases FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_purchases_updated_at BEFORE UPDATE ON public.supplier_purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update supplier totals after purchase
CREATE OR REPLACE FUNCTION public.update_supplier_due_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.suppliers
        SET total_due = (
            SELECT COALESCE(SUM(due_amount), 0)
            FROM public.supplier_purchases
            WHERE supplier_id = NEW.supplier_id
        )
        WHERE id = NEW.supplier_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.suppliers
        SET total_due = (
            SELECT COALESCE(SUM(due_amount), 0)
            FROM public.supplier_purchases
            WHERE supplier_id = OLD.supplier_id
        )
        WHERE id = OLD.supplier_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update supplier due/paid after payment
CREATE OR REPLACE FUNCTION public.update_supplier_after_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.suppliers
        SET total_paid = total_paid + NEW.amount,
            total_due = total_due - NEW.amount
        WHERE id = NEW.supplier_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.suppliers
        SET total_paid = total_paid - OLD.amount,
            total_due = total_due + OLD.amount
        WHERE id = OLD.supplier_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers
CREATE TRIGGER update_supplier_due_on_purchase
    AFTER INSERT OR UPDATE OR DELETE ON public.supplier_purchases
    FOR EACH ROW EXECUTE FUNCTION public.update_supplier_due_after_purchase();

CREATE TRIGGER update_supplier_on_payment
    AFTER INSERT OR DELETE ON public.supplier_payments
    FOR EACH ROW EXECUTE FUNCTION public.update_supplier_after_payment();

-- Indexes
CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_supplier_payments_supplier_id ON public.supplier_payments(supplier_id);
CREATE INDEX idx_supplier_payments_user_id ON public.supplier_payments(user_id);
CREATE INDEX idx_supplier_purchases_supplier_id ON public.supplier_purchases(supplier_id);
CREATE INDEX idx_supplier_purchases_user_id ON public.supplier_purchases(user_id);