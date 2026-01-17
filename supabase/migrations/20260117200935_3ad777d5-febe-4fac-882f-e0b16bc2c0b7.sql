-- Add pharmacy_logo column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pharmacy_logo text;

-- Create storage bucket for pharmacy logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pharmacy-logos', 'pharmacy-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for pharmacy logos bucket
CREATE POLICY "Anyone can view pharmacy logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pharmacy-logos');

CREATE POLICY "Authenticated users can upload pharmacy logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pharmacy-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pharmacy logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pharmacy-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own pharmacy logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'pharmacy-logos' AND auth.uid()::text = (storage.foldername(name))[1]);