-- Add is_tax_applicable field to medicines table
ALTER TABLE public.medicines
ADD COLUMN is_tax_applicable boolean NOT NULL DEFAULT false;