-- Add manufacturer_id foreign key to medicines table
ALTER TABLE public.medicines 
ADD COLUMN manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE SET NULL;