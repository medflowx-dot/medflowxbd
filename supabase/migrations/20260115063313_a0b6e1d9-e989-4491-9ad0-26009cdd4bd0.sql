-- Create manufacturers table to store manufacturer details with phone numbers
CREATE TABLE public.manufacturers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    contact_person TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for manufacturers
CREATE POLICY "Users can view their own manufacturers" 
ON public.manufacturers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manufacturers" 
ON public.manufacturers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manufacturers" 
ON public.manufacturers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manufacturers" 
ON public.manufacturers 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Owner admins can view all manufacturers" 
ON public.manufacturers 
FOR SELECT 
USING (has_role(auth.uid(), 'owner_admin'::app_role));

-- Add manufacturer_phone to stock_orders for quick access
ALTER TABLE public.stock_orders ADD COLUMN manufacturer_phone TEXT;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_manufacturers_updated_at
BEFORE UPDATE ON public.manufacturers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();