-- Create stock_orders table for managing order notes
CREATE TABLE public.stock_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    manufacturer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'received', 'cancelled')),
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_order_items table for individual items in an order
CREATE TABLE public.stock_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.stock_orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    quantity_to_order INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pcs',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stock_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stock_orders
CREATE POLICY "Users can view their own stock orders" 
ON public.stock_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stock orders" 
ON public.stock_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock orders" 
ON public.stock_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock orders" 
ON public.stock_orders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for stock_order_items
CREATE POLICY "Users can view their own stock order items" 
ON public.stock_order_items 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.stock_orders 
    WHERE stock_orders.id = stock_order_items.order_id 
    AND stock_orders.user_id = auth.uid()
));

CREATE POLICY "Users can create stock order items for their orders" 
ON public.stock_order_items 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.stock_orders 
    WHERE stock_orders.id = stock_order_items.order_id 
    AND stock_orders.user_id = auth.uid()
));

CREATE POLICY "Users can update stock order items for their orders" 
ON public.stock_order_items 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.stock_orders 
    WHERE stock_orders.id = stock_order_items.order_id 
    AND stock_orders.user_id = auth.uid()
));

CREATE POLICY "Users can delete stock order items for their orders" 
ON public.stock_order_items 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.stock_orders 
    WHERE stock_orders.id = stock_order_items.order_id 
    AND stock_orders.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_stock_orders_updated_at
BEFORE UPDATE ON public.stock_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();