-- Create medicines table
CREATE TABLE public.medicines (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT,
    manufacturer TEXT,
    unit TEXT NOT NULL DEFAULT 'pcs',
    shelf_location TEXT,
    min_stock_level INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicine_batches table for batch tracking
CREATE TABLE public.medicine_batches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    batch_number TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    expiry_date DATE NOT NULL,
    manufactured_date DATE,
    supplier_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_batches ENABLE ROW LEVEL SECURITY;

-- Medicines policies
CREATE POLICY "Users can view their own medicines"
ON public.medicines FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medicines"
ON public.medicines FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medicines"
ON public.medicines FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medicines"
ON public.medicines FOR DELETE
USING (auth.uid() = user_id);

-- Medicine batches policies
CREATE POLICY "Users can view their own batches"
ON public.medicine_batches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batches"
ON public.medicine_batches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches"
ON public.medicine_batches FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches"
ON public.medicine_batches FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_medicines_user_id ON public.medicines(user_id);
CREATE INDEX idx_medicines_name ON public.medicines(name);
CREATE INDEX idx_medicine_batches_user_id ON public.medicine_batches(user_id);
CREATE INDEX idx_medicine_batches_medicine_id ON public.medicine_batches(medicine_id);
CREATE INDEX idx_medicine_batches_expiry_date ON public.medicine_batches(expiry_date);

-- Add triggers for updated_at
CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicine_batches_updated_at
BEFORE UPDATE ON public.medicine_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();