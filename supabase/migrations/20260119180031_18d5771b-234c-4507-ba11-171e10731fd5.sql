-- Create storage bucket for CMS media
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to cms-media bucket
CREATE POLICY "Public can view cms media"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-media');

-- Allow owner_admin to upload cms media
CREATE POLICY "Owner admin can upload cms media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cms-media' 
  AND public.has_role(auth.uid(), 'owner_admin')
);

-- Allow owner_admin to update cms media
CREATE POLICY "Owner admin can update cms media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cms-media' 
  AND public.has_role(auth.uid(), 'owner_admin')
);

-- Allow owner_admin to delete cms media
CREATE POLICY "Owner admin can delete cms media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cms-media' 
  AND public.has_role(auth.uid(), 'owner_admin')
);