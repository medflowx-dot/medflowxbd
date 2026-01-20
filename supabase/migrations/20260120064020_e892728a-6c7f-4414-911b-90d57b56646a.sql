-- Insert UddoktaPay settings into platform_settings
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES 
  ('uddoktapay_api_key', '""', 'UddoktaPay API Key from dashboard'),
  ('uddoktapay_base_url', '"https://sandbox.uddoktapay.com"', 'UddoktaPay Base URL (sandbox or production)'),
  ('uddoktapay_enabled', 'false', 'Enable/Disable UddoktaPay payment gateway')
ON CONFLICT (setting_key) DO NOTHING;