-- Create storage bucket for training center logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('center-logos', 'center-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for center-logos bucket
CREATE POLICY "Admins can upload center logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'center-logos' 
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Admins can update center logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'center-logos' 
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Admins can delete center logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'center-logos' 
  AND (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Anyone can view center logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'center-logos');