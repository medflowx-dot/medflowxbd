-- Fix generate_order_number function search_path
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(random() * 10000)::text, 4, '0')
$$;