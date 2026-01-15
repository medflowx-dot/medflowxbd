-- Add purchase_price column to sale_items to capture cost at time of sale
ALTER TABLE public.sale_items 
ADD COLUMN purchase_price DECIMAL(10,2) DEFAULT 0;

-- Add comment explaining the column
COMMENT ON COLUMN public.sale_items.purchase_price IS 'Purchase price from batch at time of sale for profit calculation';