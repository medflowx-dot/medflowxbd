-- Create staff permission change logs table
CREATE TABLE public.staff_permission_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_permissions JSONB,
  new_permissions JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_permission_logs ENABLE ROW LEVEL SECURITY;

-- Pharmacy owners can view logs for their staff
CREATE POLICY "Pharmacy owners can view permission logs"
ON public.staff_permission_logs
FOR SELECT
USING (
  changed_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.staff_permissions sp
    WHERE sp.staff_user_id = staff_permission_logs.staff_user_id
    AND sp.pharmacy_owner_id = auth.uid()
  )
);

-- Pharmacy owners can insert logs
CREATE POLICY "Pharmacy owners can insert permission logs"
ON public.staff_permission_logs
FOR INSERT
WITH CHECK (changed_by = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_staff_permission_logs_staff_user ON public.staff_permission_logs(staff_user_id);
CREATE INDEX idx_staff_permission_logs_created_at ON public.staff_permission_logs(created_at DESC);