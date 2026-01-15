-- Add entry_type column to sales table
ALTER TABLE public.sales ADD COLUMN entry_type TEXT NOT NULL DEFAULT 'detailed';

-- Add sale_unit column to sale_items table
ALTER TABLE public.sale_items ADD COLUMN sale_unit TEXT NOT NULL DEFAULT 'piece';

-- Add comment for documentation
COMMENT ON COLUMN public.sales.entry_type IS 'Type of sale entry: quick (daily total) or detailed (medicine-based)';
COMMENT ON COLUMN public.sale_items.sale_unit IS 'Unit of sale: piece, strip, or box';