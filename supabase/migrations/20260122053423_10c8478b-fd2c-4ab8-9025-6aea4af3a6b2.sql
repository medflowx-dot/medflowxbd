-- Fix SMTP settings - From email must match SMTP user domain
UPDATE platform_settings 
SET setting_value = '"test@hatmeeit.xyz"', updated_at = now()
WHERE setting_key = 'smtp_from_email';

-- Ensure port is 465 for implicit SSL
UPDATE platform_settings 
SET setting_value = '465', updated_at = now()
WHERE setting_key = 'smtp_port';