-- Create storage bucket for tutor guide files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tutor-guides',
  'tutor-guides',
  true,
  52428800,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for tutor-guides bucket
CREATE POLICY "Anyone can view tutor guide files"
ON storage.objects FOR SELECT
USING (bucket_id = 'tutor-guides');

CREATE POLICY "Admins can upload tutor guide files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tutor-guides' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can delete tutor guide files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tutor-guides' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);