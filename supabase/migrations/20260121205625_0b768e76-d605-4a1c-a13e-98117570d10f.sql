-- Add platform setting for abandoned payment cleanup interval (in minutes)
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES (
  'abandoned_payment_cleanup_minutes',
  '60',
  'Minutes after which abandoned payment requests (with empty transaction ID) are automatically deleted'
)
ON CONFLICT (setting_key) DO NOTHING;