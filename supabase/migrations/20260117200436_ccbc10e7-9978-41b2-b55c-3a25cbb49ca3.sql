-- Create function to get pharmacy owner ID
-- If user is client_staff, returns their admin's user_id
-- If user is client_admin, returns their own user_id
CREATE OR REPLACE FUNCTION public.get_pharmacy_owner_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = _user_id AND role = 'client_staff')
      THEN (
        SELECT p2.user_id 
        FROM profiles p1
        JOIN profiles p2 ON p1.pharmacy_name = p2.pharmacy_name AND p1.pharmacy_name IS NOT NULL
        JOIN user_roles ur ON ur.user_id = p2.user_id
        WHERE p1.user_id = _user_id 
        AND ur.role = 'client_admin'
        LIMIT 1
      )
      ELSE _user_id
    END;
$$;

-- Update RLS policies for medicines table
DROP POLICY IF EXISTS "Users can view their own medicines" ON medicines;
DROP POLICY IF EXISTS "Users can create their own medicines" ON medicines;
DROP POLICY IF EXISTS "Users can update their own medicines" ON medicines;
DROP POLICY IF EXISTS "Users can delete their own medicines" ON medicines;

CREATE POLICY "Users can view pharmacy medicines" ON medicines FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy medicines" ON medicines FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy medicines" ON medicines FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy medicines" ON medicines FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for medicine_batches table
DROP POLICY IF EXISTS "Users can view their own batches" ON medicine_batches;
DROP POLICY IF EXISTS "Users can create their own batches" ON medicine_batches;
DROP POLICY IF EXISTS "Users can update their own batches" ON medicine_batches;
DROP POLICY IF EXISTS "Users can delete their own batches" ON medicine_batches;

CREATE POLICY "Users can view pharmacy batches" ON medicine_batches FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy batches" ON medicine_batches FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy batches" ON medicine_batches FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy batches" ON medicine_batches FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for sales table
DROP POLICY IF EXISTS "Users can view their own sales" ON sales;
DROP POLICY IF EXISTS "Users can create their own sales" ON sales;
DROP POLICY IF EXISTS "Users can update their own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete their own sales" ON sales;

CREATE POLICY "Users can view pharmacy sales" ON sales FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy sales" ON sales FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy sales" ON sales FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy sales" ON sales FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for sale_items table
DROP POLICY IF EXISTS "Users can view sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can create sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can delete sale items" ON sale_items;

CREATE POLICY "Users can view pharmacy sale items" ON sale_items FOR SELECT
USING (EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND (sales.user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'))));

CREATE POLICY "Users can create pharmacy sale items" ON sale_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = get_pharmacy_owner_id(auth.uid())));

CREATE POLICY "Users can delete pharmacy sale items" ON sale_items FOR DELETE
USING (EXISTS (SELECT 1 FROM sales WHERE sales.id = sale_items.sale_id AND sales.user_id = get_pharmacy_owner_id(auth.uid())));

-- Update RLS policies for customers table
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can create their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

CREATE POLICY "Users can view pharmacy customers" ON customers FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy customers" ON customers FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy customers" ON customers FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy customers" ON customers FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for customer_payments table
DROP POLICY IF EXISTS "Users can view their own payments" ON customer_payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON customer_payments;
DROP POLICY IF EXISTS "Users can delete their own payments" ON customer_payments;

CREATE POLICY "Users can view pharmacy customer payments" ON customer_payments FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy customer payments" ON customer_payments FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy customer payments" ON customer_payments FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for suppliers table
DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can create their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

CREATE POLICY "Users can view pharmacy suppliers" ON suppliers FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy suppliers" ON suppliers FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy suppliers" ON suppliers FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy suppliers" ON suppliers FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for supplier_payments table
DROP POLICY IF EXISTS "Users can view their own supplier payments" ON supplier_payments;
DROP POLICY IF EXISTS "Users can create their own supplier payments" ON supplier_payments;
DROP POLICY IF EXISTS "Users can delete their own supplier payments" ON supplier_payments;

CREATE POLICY "Users can view pharmacy supplier payments" ON supplier_payments FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy supplier payments" ON supplier_payments FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy supplier payments" ON supplier_payments FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for supplier_purchases table
DROP POLICY IF EXISTS "Users can view their own supplier purchases" ON supplier_purchases;
DROP POLICY IF EXISTS "Users can create their own supplier purchases" ON supplier_purchases;
DROP POLICY IF EXISTS "Users can update their own supplier purchases" ON supplier_purchases;
DROP POLICY IF EXISTS "Users can delete their own supplier purchases" ON supplier_purchases;

CREATE POLICY "Users can view pharmacy supplier purchases" ON supplier_purchases FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy supplier purchases" ON supplier_purchases FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy supplier purchases" ON supplier_purchases FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy supplier purchases" ON supplier_purchases FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for manufacturers table
DROP POLICY IF EXISTS "Users can view their own manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Users can create their own manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Users can update their own manufacturers" ON manufacturers;
DROP POLICY IF EXISTS "Users can delete their own manufacturers" ON manufacturers;

CREATE POLICY "Users can view pharmacy manufacturers" ON manufacturers FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy manufacturers" ON manufacturers FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy manufacturers" ON manufacturers FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy manufacturers" ON manufacturers FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for daily_costs table
DROP POLICY IF EXISTS "Users can view their own costs" ON daily_costs;
DROP POLICY IF EXISTS "Users can create their own costs" ON daily_costs;
DROP POLICY IF EXISTS "Users can update their own costs" ON daily_costs;
DROP POLICY IF EXISTS "Users can delete their own costs" ON daily_costs;

CREATE POLICY "Users can view pharmacy costs" ON daily_costs FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy costs" ON daily_costs FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy costs" ON daily_costs FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy costs" ON daily_costs FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for opening_cash table
DROP POLICY IF EXISTS "Users can view their own opening cash" ON opening_cash;
DROP POLICY IF EXISTS "Users can create their own opening cash" ON opening_cash;
DROP POLICY IF EXISTS "Users can update their own opening cash" ON opening_cash;
DROP POLICY IF EXISTS "Users can delete their own opening cash" ON opening_cash;

CREATE POLICY "Users can view pharmacy opening cash" ON opening_cash FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy opening cash" ON opening_cash FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy opening cash" ON opening_cash FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy opening cash" ON opening_cash FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for stock_orders table
DROP POLICY IF EXISTS "Users can view their own stock orders" ON stock_orders;
DROP POLICY IF EXISTS "Users can create their own stock orders" ON stock_orders;
DROP POLICY IF EXISTS "Users can update their own stock orders" ON stock_orders;
DROP POLICY IF EXISTS "Users can delete their own stock orders" ON stock_orders;

CREATE POLICY "Users can view pharmacy stock orders" ON stock_orders FOR SELECT
USING (user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Users can create pharmacy stock orders" ON stock_orders FOR INSERT
WITH CHECK (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can update pharmacy stock orders" ON stock_orders FOR UPDATE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

CREATE POLICY "Users can delete pharmacy stock orders" ON stock_orders FOR DELETE
USING (user_id = get_pharmacy_owner_id(auth.uid()));

-- Update RLS policies for stock_order_items table
DROP POLICY IF EXISTS "Users can view their own stock order items" ON stock_order_items;
DROP POLICY IF EXISTS "Users can create stock order items for their orders" ON stock_order_items;
DROP POLICY IF EXISTS "Users can update stock order items for their orders" ON stock_order_items;
DROP POLICY IF EXISTS "Users can delete stock order items for their orders" ON stock_order_items;

CREATE POLICY "Users can view pharmacy stock order items" ON stock_order_items FOR SELECT
USING (EXISTS (SELECT 1 FROM stock_orders WHERE stock_orders.id = stock_order_items.order_id AND (stock_orders.user_id = get_pharmacy_owner_id(auth.uid()) OR has_role(auth.uid(), 'owner_admin'))));

CREATE POLICY "Users can create pharmacy stock order items" ON stock_order_items FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM stock_orders WHERE stock_orders.id = stock_order_items.order_id AND stock_orders.user_id = get_pharmacy_owner_id(auth.uid())));

CREATE POLICY "Users can update pharmacy stock order items" ON stock_order_items FOR UPDATE
USING (EXISTS (SELECT 1 FROM stock_orders WHERE stock_orders.id = stock_order_items.order_id AND stock_orders.user_id = get_pharmacy_owner_id(auth.uid())));

CREATE POLICY "Users can delete pharmacy stock order items" ON stock_order_items FOR DELETE
USING (EXISTS (SELECT 1 FROM stock_orders WHERE stock_orders.id = stock_order_items.order_id AND stock_orders.user_id = get_pharmacy_owner_id(auth.uid())));