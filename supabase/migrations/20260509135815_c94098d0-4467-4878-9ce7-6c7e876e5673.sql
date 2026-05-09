CREATE POLICY "Teachers can view communication attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND (storage.foldername(name))[2] = 'communications'
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
);