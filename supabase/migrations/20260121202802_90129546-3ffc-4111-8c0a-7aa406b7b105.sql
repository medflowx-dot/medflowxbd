-- Add a policy to allow all authenticated users to read payment gateway settings
CREATE POLICY "Authenticated users can read payment gateway settings"
ON public.platform_settings
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND setting_key IN ('uddoktapay_enabled', 'uddoktapay_base_url')
);