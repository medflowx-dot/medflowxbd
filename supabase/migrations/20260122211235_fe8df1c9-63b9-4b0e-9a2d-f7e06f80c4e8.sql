-- Add prescription-specific permission columns to staff_permissions table
ALTER TABLE public.staff_permissions
ADD COLUMN IF NOT EXISTS can_view_prescriptions BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS can_manage_prescriptions BOOLEAN NOT NULL DEFAULT false;