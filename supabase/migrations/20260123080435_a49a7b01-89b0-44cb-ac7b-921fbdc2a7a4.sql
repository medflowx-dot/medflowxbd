-- Create admin team role enum
CREATE TYPE public.admin_team_role AS ENUM (
  'manager', 
  'support', 
  'staff', 
  'technical_it'
);

-- Create admin team members table
CREATE TABLE public.admin_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  team_role admin_team_role NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create admin team permissions table
CREATE TABLE public.admin_team_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES public.admin_team_members(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Dashboard
  can_view_dashboard BOOLEAN DEFAULT true NOT NULL,
  
  -- Client Management
  can_view_clients BOOLEAN DEFAULT false NOT NULL,
  can_manage_clients BOOLEAN DEFAULT false NOT NULL,
  can_delete_clients BOOLEAN DEFAULT false NOT NULL,
  
  -- Subscription Management
  can_view_subscriptions BOOLEAN DEFAULT false NOT NULL,
  can_manage_subscriptions BOOLEAN DEFAULT false NOT NULL,
  
  -- Payment Management
  can_view_payments BOOLEAN DEFAULT false NOT NULL,
  can_manage_payments BOOLEAN DEFAULT false NOT NULL,
  can_process_refunds BOOLEAN DEFAULT false NOT NULL,
  
  -- Pricing Plans
  can_view_pricing BOOLEAN DEFAULT false NOT NULL,
  can_manage_pricing BOOLEAN DEFAULT false NOT NULL,
  
  -- Master Data (Global Medicines, Manufacturers)
  can_view_master_data BOOLEAN DEFAULT false NOT NULL,
  can_manage_master_data BOOLEAN DEFAULT false NOT NULL,
  
  -- System Settings
  can_view_settings BOOLEAN DEFAULT false NOT NULL,
  can_manage_settings BOOLEAN DEFAULT false NOT NULL,
  
  -- Audit Logs
  can_view_audit_logs BOOLEAN DEFAULT false NOT NULL,
  
  -- Feature Flags
  can_view_feature_flags BOOLEAN DEFAULT false NOT NULL,
  can_manage_feature_flags BOOLEAN DEFAULT false NOT NULL,
  
  -- CMS Management
  can_view_cms BOOLEAN DEFAULT false NOT NULL,
  can_manage_cms BOOLEAN DEFAULT false NOT NULL,
  
  -- Email Templates
  can_view_email_templates BOOLEAN DEFAULT false NOT NULL,
  can_manage_email_templates BOOLEAN DEFAULT false NOT NULL,
  
  -- Notifications
  can_send_notifications BOOLEAN DEFAULT false NOT NULL,
  
  -- System Review / Impersonation
  can_impersonate_users BOOLEAN DEFAULT false NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_team_permissions ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin team member
CREATE OR REPLACE FUNCTION public.is_admin_team_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_team_members
    WHERE user_id = _user_id
    AND is_active = true
  )
$$;

-- RLS Policies for admin_team_members
-- Owner admin can do everything
CREATE POLICY "Owner admin can manage admin team members"
ON public.admin_team_members
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner_admin'))
WITH CHECK (public.has_role(auth.uid(), 'owner_admin'));

-- Team members can view their own record
CREATE POLICY "Team members can view own record"
ON public.admin_team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for admin_team_permissions
-- Owner admin can do everything
CREATE POLICY "Owner admin can manage admin team permissions"
ON public.admin_team_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'owner_admin'))
WITH CHECK (public.has_role(auth.uid(), 'owner_admin'));

-- Team members can view their own permissions
CREATE POLICY "Team members can view own permissions"
ON public.admin_team_permissions
FOR SELECT
TO authenticated
USING (
  team_member_id IN (
    SELECT id FROM public.admin_team_members WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_team_members_updated_at
BEFORE UPDATE ON public.admin_team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_team_permissions_updated_at
BEFORE UPDATE ON public.admin_team_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_admin_team_members_user_id ON public.admin_team_members(user_id);
CREATE INDEX idx_admin_team_members_is_active ON public.admin_team_members(is_active);
CREATE INDEX idx_admin_team_permissions_team_member_id ON public.admin_team_permissions(team_member_id);