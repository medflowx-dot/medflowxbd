-- Add manufacturer_id to suppliers table (required link: One Supplier = One Manufacturer)
ALTER TABLE public.suppliers 
ADD COLUMN manufacturer_id uuid REFERENCES public.manufacturers(id) ON DELETE SET NULL;

-- Add whatsapp_number to suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN whatsapp_number text;

-- Create stock_short_notes table (the note/list header)
CREATE TABLE public.stock_short_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  note_date date NOT NULL DEFAULT CURRENT_DATE,
  remarks text,
  status text NOT NULL DEFAULT 'active', -- active, completed
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create stock_short_items table (items in each note, grouped by manufacturer)
CREATE TABLE public.stock_short_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.stock_short_notes(id) ON DELETE CASCADE,
  manufacturer_id uuid NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  is_tax_applicable boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (note_id, medicine_id) -- Same medicine cannot be duplicated in same note
);

-- Create supplier_orders table (orders created from stock short notes)
CREATE TABLE public.supplier_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  note_id uuid REFERENCES public.stock_short_notes(id) ON DELETE SET NULL,
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, ordered, received
  order_date timestamp with time zone NOT NULL DEFAULT now(),
  ordered_at timestamp with time zone, -- when marked as ordered
  received_at timestamp with time zone, -- when marked as received
  total_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  due_amount numeric NOT NULL DEFAULT 0,
  payment_method text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create supplier_order_items table (items in each order)
CREATE TABLE public.supplier_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.supplier_orders(id) ON DELETE CASCADE,
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  is_tax_applicable boolean NOT NULL DEFAULT false,
  unit text NOT NULL DEFAULT 'pcs',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.stock_short_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_short_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_short_notes
CREATE POLICY "Users can view pharmacy stock short notes"
ON public.stock_short_notes FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'::app_role));

CREATE POLICY "Users can create pharmacy stock short notes"
ON public.stock_short_notes FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy stock short notes"
ON public.stock_short_notes FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy stock short notes"
ON public.stock_short_notes FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- RLS Policies for stock_short_items
CREATE POLICY "Users can view pharmacy stock short items"
ON public.stock_short_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.stock_short_notes
  WHERE stock_short_notes.id = stock_short_items.note_id
  AND (stock_short_notes.user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'::app_role))
));

CREATE POLICY "Users can create pharmacy stock short items"
ON public.stock_short_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.stock_short_notes
  WHERE stock_short_notes.id = stock_short_items.note_id
  AND stock_short_notes.user_id = get_pharmacy_owner_id(auth.uid())
));

CREATE POLICY "Users can update pharmacy stock short items"
ON public.stock_short_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.stock_short_notes
  WHERE stock_short_notes.id = stock_short_items.note_id
  AND stock_short_notes.user_id = get_pharmacy_owner_id(auth.uid())
));

CREATE POLICY "Users can delete pharmacy stock short items"
ON public.stock_short_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.stock_short_notes
  WHERE stock_short_notes.id = stock_short_items.note_id
  AND stock_short_notes.user_id = get_pharmacy_owner_id(auth.uid())
));

-- RLS Policies for supplier_orders
CREATE POLICY "Users can view pharmacy supplier orders"
ON public.supplier_orders FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'::app_role));

CREATE POLICY "Users can create pharmacy supplier orders"
ON public.supplier_orders FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy supplier orders"
ON public.supplier_orders FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy supplier orders"
ON public.supplier_orders FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- RLS Policies for supplier_order_items
CREATE POLICY "Users can view pharmacy supplier order items"
ON public.supplier_order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.supplier_orders
  WHERE supplier_orders.id = supplier_order_items.order_id
  AND (supplier_orders.user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'::app_role))
));

CREATE POLICY "Users can create pharmacy supplier order items"
ON public.supplier_order_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.supplier_orders
  WHERE supplier_orders.id = supplier_order_items.order_id
  AND supplier_orders.user_id = get_pharmacy_owner_id(auth.uid())
));

CREATE POLICY "Users can delete pharmacy supplier order items"
ON public.supplier_order_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.supplier_orders
  WHERE supplier_orders.id = supplier_order_items.order_id
  AND supplier_orders.user_id = get_pharmacy_owner_id(auth.uid())
));

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(random() * 10000)::text, 4, '0')
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_stock_short_notes_updated_at
BEFORE UPDATE ON public.stock_short_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_orders_updated_at
BEFORE UPDATE ON public.supplier_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();