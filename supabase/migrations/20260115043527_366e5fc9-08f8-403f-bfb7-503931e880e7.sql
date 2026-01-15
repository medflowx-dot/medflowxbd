-- Create customers table
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    notes TEXT,
    total_due DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    due_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES public.medicines(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.medicine_batches(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    batch_number TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_payments table for tracking due payments
CREATE TABLE public.customer_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view their own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- Sales policies
CREATE POLICY "Users can view their own sales" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales" ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales" ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- Sale items policies (via sale ownership)
CREATE POLICY "Users can view sale items" ON public.sale_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
CREATE POLICY "Users can create sale items" ON public.sale_items FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));
CREATE POLICY "Users can delete sale items" ON public.sale_items FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.user_id = auth.uid()));

-- Customer payments policies
CREATE POLICY "Users can view their own payments" ON public.customer_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payments" ON public.customer_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payments" ON public.customer_payments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_sales_user_id ON public.sales(user_id);
CREATE INDEX idx_sales_customer_id ON public.sales(customer_id);
CREATE INDEX idx_sales_sale_date ON public.sales(sale_date);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX idx_customer_payments_customer_id ON public.customer_payments(customer_id);
CREATE INDEX idx_customer_payments_payment_date ON public.customer_payments(payment_date);

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    today_count INTEGER;
    invoice TEXT;
BEGIN
    SELECT COUNT(*) + 1 INTO today_count
    FROM public.sales
    WHERE sale_date = CURRENT_DATE;
    
    invoice := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 4, '0');
    RETURN invoice;
END;
$$;

-- Function to update customer total_due
CREATE OR REPLACE FUNCTION public.update_customer_due()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.customer_id IS NOT NULL THEN
            UPDATE public.customers
            SET total_due = (
                SELECT COALESCE(SUM(due_amount), 0)
                FROM public.sales
                WHERE customer_id = NEW.customer_id
            )
            WHERE id = NEW.customer_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.customer_id IS NOT NULL THEN
            UPDATE public.customers
            SET total_due = (
                SELECT COALESCE(SUM(due_amount), 0)
                FROM public.sales
                WHERE customer_id = OLD.customer_id
            )
            WHERE id = OLD.customer_id;
        END IF;
        RETURN OLD;
    END IF;
END;
$$;

-- Trigger to auto-update customer due
CREATE TRIGGER update_customer_due_on_sale
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_customer_due();

-- Function to update sale due after payment
CREATE OR REPLACE FUNCTION public.update_sale_due_after_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.sale_id IS NOT NULL THEN
            UPDATE public.sales
            SET paid_amount = paid_amount + NEW.amount,
                due_amount = due_amount - NEW.amount
            WHERE id = NEW.sale_id;
        END IF;
        
        UPDATE public.customers
        SET total_due = total_due - NEW.amount
        WHERE id = NEW.customer_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.sale_id IS NOT NULL THEN
            UPDATE public.sales
            SET paid_amount = paid_amount - OLD.amount,
                due_amount = due_amount + OLD.amount
            WHERE id = OLD.sale_id;
        END IF;
        
        UPDATE public.customers
        SET total_due = total_due + OLD.amount
        WHERE id = OLD.customer_id;
        
        RETURN OLD;
    END IF;
END;
$$;

CREATE TRIGGER update_due_after_payment
AFTER INSERT OR DELETE ON public.customer_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_sale_due_after_payment();