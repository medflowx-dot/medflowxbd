-- Insert support contact settings if they don't exist
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES 
  ('support_phone', '"+880 1604-334494"', 'Support phone number shown on billing page'),
  ('support_email', '"support@medflowx.com"', 'Support email shown on billing page'),
  ('support_whatsapp', '"+8801604334494"', 'WhatsApp number for support (with country code)')
ON CONFLICT (setting_key) DO NOTHING;