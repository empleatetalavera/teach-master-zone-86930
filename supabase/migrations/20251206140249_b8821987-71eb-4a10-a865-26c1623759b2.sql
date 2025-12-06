-- Create storage bucket for center logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('center-logos', 'center-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload center logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'center-logos');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update center logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'center-logos');

-- Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete center logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'center-logos');

-- Allow public access to view logos
CREATE POLICY "Public can view center logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'center-logos');