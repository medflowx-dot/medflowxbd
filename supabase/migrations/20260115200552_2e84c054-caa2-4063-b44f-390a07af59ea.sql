-- Add SMTP settings to platform_settings
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES 
  ('smtp_host', '""', 'SMTP server host'),
  ('smtp_port', '587', 'SMTP server port'),
  ('smtp_user', '""', 'SMTP username/email'),
  ('smtp_password', '""', 'SMTP password (encrypted)'),
  ('smtp_from_email', '""', 'From email address'),
  ('smtp_from_name', '"MedFlowX"', 'From display name'),
  ('smtp_secure', 'true', 'Use TLS/SSL')
ON CONFLICT (setting_key) DO NOTHING;