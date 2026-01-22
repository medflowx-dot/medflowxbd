-- Add manage permissions for Manufacturers, Stock Short List, and Reports
ALTER TABLE public.staff_permissions
ADD COLUMN IF NOT EXISTS can_manage_manufacturers BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_stock_short BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_reports BOOLEAN DEFAULT false;