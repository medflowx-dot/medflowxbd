-- Create audit_logs table for tracking all owner admin actions
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    target_user_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_settings table for owner configuration
CREATE TABLE public.platform_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing_plans table for plan configuration
CREATE TABLE public.pricing_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BDT',
    duration_days INTEGER,
    features JSONB,
    user_limit INTEGER,
    trial_restrictions JSONB,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cms_pages table for CMS content
CREATE TABLE public.cms_pages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_slug TEXT NOT NULL UNIQUE,
    page_title TEXT NOT NULL,
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cms_sections table for page sections
CREATE TABLE public.cms_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    section_key TEXT NOT NULL,
    content JSONB NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(page_id, section_key)
);

-- Create cms_media table for media uploads
CREATE TABLE public.cms_media (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    alt_text TEXT,
    uploaded_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create impersonation_sessions table for one-click login tracking
CREATE TABLE public.impersonation_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (only owner_admin can view)
CREATE POLICY "Owner admins can view all audit logs"
    ON public.audit_logs FOR SELECT
    USING (has_role(auth.uid(), 'owner_admin'));

CREATE POLICY "Owner admins can create audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (has_role(auth.uid(), 'owner_admin'));

-- RLS Policies for platform_settings
CREATE POLICY "Owner admins can manage platform settings"
    ON public.platform_settings FOR ALL
    USING (has_role(auth.uid(), 'owner_admin'));

-- RLS Policies for pricing_plans (public read, owner_admin write)
CREATE POLICY "Anyone can view active pricing plans"
    ON public.pricing_plans FOR SELECT
    USING (is_active = true);

CREATE POLICY "Owner admins can manage all pricing plans"
    ON public.pricing_plans FOR ALL
    USING (has_role(auth.uid(), 'owner_admin'));

-- RLS Policies for cms_pages (public read published, owner_admin all)
CREATE POLICY "Anyone can view published cms pages"
    ON public.cms_pages FOR SELECT
    USING (is_published = true);

CREATE POLICY "Owner admins can manage all cms pages"
    ON public.cms_pages FOR ALL
    USING (has_role(auth.uid(), 'owner_admin'));

-- RLS Policies for cms_sections (public read visible, owner_admin all)
CREATE POLICY "Anyone can view visible cms sections"
    ON public.cms_sections FOR SELECT
    USING (is_visible = true AND EXISTS (
        SELECT 1 FROM public.cms_pages WHERE id = page_id AND is_published = true
    ));

CREATE POLICY "Owner admins can manage all cms sections"
    ON public.cms_sections FOR ALL
    USING (has_role(auth.uid(), 'owner_admin'));

-- RLS Policies for cms_media
CREATE POLICY "Anyone can view cms media"
    ON public.cms_media FOR SELECT
    USING (true);

CREATE POLICY "Owner admins can manage all cms media"
    ON public.cms_media FOR ALL
    USING (has_role(auth.uid(), 'owner_admin'));

-- RLS Policies for impersonation_sessions
CREATE POLICY "Owner admins can manage impersonation sessions"
    ON public.impersonation_sessions FOR ALL
    USING (has_role(auth.uid(), 'owner_admin'));

-- Create indexes for performance
CREATE INDEX idx_audit_logs_admin_user ON public.audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX idx_cms_sections_page_id ON public.cms_sections(page_id);
CREATE INDEX idx_impersonation_sessions_token ON public.impersonation_sessions(session_token);
CREATE INDEX idx_impersonation_sessions_active ON public.impersonation_sessions(is_active, expires_at);

-- Insert default pricing plans
INSERT INTO public.pricing_plans (plan_name, display_name, price, duration_days, features, user_limit, trial_restrictions, sort_order) VALUES
('trial', 'Free Trial', 0, 7, '{"basic_inventory": true, "sales_tracking": true, "reports": true, "staff_creation": false}'::jsonb, 1, '{"staff_creation": false}'::jsonb, 1),
('monthly', 'Monthly Plan', 499, 30, '{"basic_inventory": true, "sales_tracking": true, "reports": true, "staff_creation": true, "priority_support": false}'::jsonb, 5, null, 2),
('yearly', 'Yearly Plan', 4999, 365, '{"basic_inventory": true, "sales_tracking": true, "reports": true, "staff_creation": true, "priority_support": true}'::jsonb, 10, null, 3),
('lifetime', 'Lifetime Plan', 14999, null, '{"basic_inventory": true, "sales_tracking": true, "reports": true, "staff_creation": true, "priority_support": true, "lifetime": true}'::jsonb, null, null, 4);

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) VALUES
('platform_name', '"MedFlowX"'::jsonb, 'Platform display name'),
('default_currency', '"BDT"'::jsonb, 'Default currency for payments'),
('trial_duration_days', '7'::jsonb, 'Default trial duration in days'),
('date_format', '"DD/MM/YYYY"'::jsonb, 'Default date format'),
('time_format', '"12h"'::jsonb, 'Default time format (12h or 24h)'),
('auto_renew_enabled', 'true'::jsonb, 'Enable auto-renewal for subscriptions'),
('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode'),
('yearly_service_charge', '999'::jsonb, 'Yearly service charge for lifetime plans');

-- Insert default CMS homepage
INSERT INTO public.cms_pages (page_slug, page_title, meta_description, is_published) VALUES
('homepage', 'MedFlowX - Pharmacy Management Software', 'Complete pharmacy management solution for Bangladesh', true);

-- Get the homepage id and insert sections
INSERT INTO public.cms_sections (page_id, section_type, section_key, content, sort_order, is_visible)
SELECT 
    id as page_id,
    'hero' as section_type,
    'hero' as section_key,
    '{
        "title": "আপনার ফার্মেসি ব্যবসা সহজ করুন",
        "subtitle": "MedFlowX দিয়ে আপনার ওষুধের দোকান ডিজিটাল করুন",
        "cta_primary": {"text": "ফ্রি ট্রায়াল শুরু করুন", "link": "/signup"},
        "cta_secondary": {"text": "ডেমো দেখুন", "link": "#demo"}
    }'::jsonb as content,
    1 as sort_order,
    true as is_visible
FROM public.cms_pages WHERE page_slug = 'homepage'
UNION ALL
SELECT 
    id,
    'features',
    'features',
    '{
        "title": "কেন MedFlowX?",
        "items": [
            {"icon": "Package", "title": "স্টক ম্যানেজমেন্ট", "description": "ওষুধের স্টক ট্র্যাক করুন এবং এক্সপায়ারি এলার্ট পান"},
            {"icon": "ShoppingCart", "title": "বিক্রয় ট্র্যাকিং", "description": "প্রতিদিনের বিক্রয় রেকর্ড রাখুন"},
            {"icon": "Users", "title": "বাকি হিসাব", "description": "কাস্টমার ও সাপ্লায়ার বাকি পরিচালনা করুন"},
            {"icon": "FileText", "title": "রিপোর্ট", "description": "বিস্তারিত রিপোর্ট ও পিডিএফ এক্সপোর্ট"}
        ]
    }'::jsonb,
    2,
    true
FROM public.cms_pages WHERE page_slug = 'homepage'
UNION ALL
SELECT 
    id,
    'pricing',
    'pricing',
    '{
        "title": "প্রাইসিং",
        "subtitle": "আপনার জন্য সঠিক প্ল্যান বেছে নিন"
    }'::jsonb,
    3,
    true
FROM public.cms_pages WHERE page_slug = 'homepage'
UNION ALL
SELECT 
    id,
    'faq',
    'faq',
    '{
        "title": "সাধারণ প্রশ্ন",
        "items": [
            {"question": "ফ্রি ট্রায়ালে কি কি সুবিধা পাবো?", "answer": "৭ দিনের ফ্রি ট্রায়ালে আপনি সব বেসিক ফিচার ব্যবহার করতে পারবেন।"},
            {"question": "পেমেন্ট মেথড কি কি?", "answer": "বিকাশ, নগদ, রকেট এবং ব্যাংক ট্রান্সফার সাপোর্ট করা হয়।"}
        ]
    }'::jsonb,
    4,
    true
FROM public.cms_pages WHERE page_slug = 'homepage'
UNION ALL
SELECT 
    id,
    'contact',
    'contact',
    '{
        "title": "যোগাযোগ",
        "phone": "+880 1XXX-XXXXXX",
        "email": "support@medflowx.com",
        "address": "ঢাকা, বাংলাদেশ"
    }'::jsonb,
    5,
    true
FROM public.cms_pages WHERE page_slug = 'homepage';

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action_type TEXT,
    p_target_type TEXT,
    p_target_id UUID DEFAULT NULL,
    p_target_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (admin_user_id, action_type, target_type, target_id, target_user_id, details)
    VALUES (auth.uid(), p_action_type, p_target_type, p_target_id, p_target_user_id, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;