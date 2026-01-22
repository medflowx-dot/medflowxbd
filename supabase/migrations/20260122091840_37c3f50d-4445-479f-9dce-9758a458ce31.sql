-- Create staff_permissions table for custom staff permission control
CREATE TABLE public.staff_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_user_id UUID NOT NULL,
    pharmacy_owner_id UUID NOT NULL,
    
    -- Module Permissions (boolean flags)
    can_view_medicines BOOLEAN DEFAULT true,
    can_manage_medicines BOOLEAN DEFAULT false,
    can_view_sales BOOLEAN DEFAULT true,
    can_manage_sales BOOLEAN DEFAULT true,
    can_view_customer_dues BOOLEAN DEFAULT true,
    can_manage_customer_dues BOOLEAN DEFAULT false,
    can_view_suppliers BOOLEAN DEFAULT false,
    can_manage_suppliers BOOLEAN DEFAULT false,
    can_view_manufacturers BOOLEAN DEFAULT false,
    can_view_daily_cash BOOLEAN DEFAULT true,
    can_manage_daily_cash BOOLEAN DEFAULT true,
    can_view_stock_short BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(staff_user_id)
);

-- Enable RLS
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Client admins can view permissions of their pharmacy staff
CREATE POLICY "Client admins can view staff permissions"
ON public.staff_permissions
FOR SELECT
USING (
    pharmacy_owner_id = auth.uid() 
    OR staff_user_id = auth.uid()
    OR has_role(auth.uid(), 'owner_admin'::app_role)
);

-- Policy: Client admins can insert permissions for their staff
CREATE POLICY "Client admins can create staff permissions"
ON public.staff_permissions
FOR INSERT
WITH CHECK (
    pharmacy_owner_id = auth.uid()
    OR has_role(auth.uid(), 'owner_admin'::app_role)
);

-- Policy: Client admins can update their staff permissions
CREATE POLICY "Client admins can update staff permissions"
ON public.staff_permissions
FOR UPDATE
USING (
    pharmacy_owner_id = auth.uid()
    OR has_role(auth.uid(), 'owner_admin'::app_role)
);

-- Policy: Client admins can delete staff permissions
CREATE POLICY "Client admins can delete staff permissions"
ON public.staff_permissions
FOR DELETE
USING (
    pharmacy_owner_id = auth.uid()
    OR has_role(auth.uid(), 'owner_admin'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_staff_permissions_updated_at
BEFORE UPDATE ON public.staff_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();