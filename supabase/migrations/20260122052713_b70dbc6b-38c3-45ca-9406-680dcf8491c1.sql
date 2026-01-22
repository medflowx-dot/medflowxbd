-- Update smtp_from_email to match the SMTP user (required for proper email delivery)
UPDATE platform_settings 
SET setting_value = '"test@hatmeeit.xyz"', updated_at = now()
WHERE setting_key = 'smtp_from_email';