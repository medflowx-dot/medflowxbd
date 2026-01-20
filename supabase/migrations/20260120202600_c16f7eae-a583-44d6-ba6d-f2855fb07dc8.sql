-- Create storage bucket for platform-wide assets (logos, favicon)
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-assets', 'platform-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view platform assets (public bucket)
CREATE POLICY "Platform assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-assets');

-- Only owner admins can upload/update platform assets
CREATE POLICY "Owner admins can upload platform assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'platform-assets' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'owner_admin'
  )
);

CREATE POLICY "Owner admins can update platform assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'platform-assets' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'owner_admin'
  )
);

CREATE POLICY "Owner admins can delete platform assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'platform-assets' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'owner_admin'
  )
);