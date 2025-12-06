-- Drop existing policies and recreate with teacher access
DROP POLICY IF EXISTS "Admins can upload tutor guide files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete tutor guide files" ON storage.objects;

-- Allow teachers, admins and super_admins to upload files
CREATE POLICY "Teachers and admins can upload tutor guide files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tutor-guides' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'teacher')
  )
);

-- Allow teachers, admins and super_admins to delete files
CREATE POLICY "Teachers and admins can delete tutor guide files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tutor-guides' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'teacher')
  )
);