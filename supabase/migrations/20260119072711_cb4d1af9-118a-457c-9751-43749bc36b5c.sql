-- Create global_manufacturers table
CREATE TABLE public.global_manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create global_medicines table
CREATE TABLE public.global_medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT,
    manufacturer_id UUID REFERENCES public.global_manufacturers(id),
    unit TEXT DEFAULT 'pcs',
    is_tax_applicable BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_medicines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for global_manufacturers
-- All authenticated users can read
CREATE POLICY "Authenticated users can view global manufacturers"
ON public.global_manufacturers
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only owner_admin can insert
CREATE POLICY "Owner admins can create global manufacturers"
ON public.global_manufacturers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner_admin'::app_role));

-- Only owner_admin can update
CREATE POLICY "Owner admins can update global manufacturers"
ON public.global_manufacturers
FOR UPDATE
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Only owner_admin can delete
CREATE POLICY "Owner admins can delete global manufacturers"
ON public.global_manufacturers
FOR DELETE
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- RLS Policies for global_medicines
-- All authenticated users can read
CREATE POLICY "Authenticated users can view global medicines"
ON public.global_medicines
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only owner_admin can insert
CREATE POLICY "Owner admins can create global medicines"
ON public.global_medicines
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'owner_admin'::app_role));

-- Only owner_admin can update
CREATE POLICY "Owner admins can update global medicines"
ON public.global_medicines
FOR UPDATE
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Only owner_admin can delete
CREATE POLICY "Owner admins can delete global medicines"
ON public.global_medicines
FOR DELETE
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_global_manufacturers_name ON public.global_manufacturers(name);
CREATE INDEX idx_global_medicines_name ON public.global_medicines(name);
CREATE INDEX idx_global_medicines_manufacturer ON public.global_medicines(manufacturer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_global_manufacturers_updated_at
BEFORE UPDATE ON public.global_manufacturers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_global_medicines_updated_at
BEFORE UPDATE ON public.global_medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();