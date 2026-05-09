DROP POLICY IF EXISTS "Teachers and admins can upload course images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and admins can update course images" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and admins can delete course images" ON storage.objects;

CREATE POLICY "Teachers and admins can upload course images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-images'
  AND (
    has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

CREATE POLICY "Teachers and admins can update course images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-images'
  AND (
    has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

CREATE POLICY "Teachers and admins can delete course images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-images'
  AND (
    has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);