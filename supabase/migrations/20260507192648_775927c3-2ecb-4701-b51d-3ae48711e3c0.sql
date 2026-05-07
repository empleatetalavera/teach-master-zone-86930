BEGIN;

DROP POLICY IF EXISTS "Teachers and admins can manage SCORM packages" ON public.scorm_packages;
CREATE POLICY "Teachers, admins and super admins can manage SCORM packages"
ON public.scorm_packages FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Teachers and admins can manage module SCORM content" ON public.module_scorm_content;
CREATE POLICY "Teachers, admins and super admins can manage module SCORM content"
ON public.module_scorm_content FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Teachers and admins can upload SCORM packages" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and admins can update SCORM packages" ON storage.objects;
DROP POLICY IF EXISTS "Teachers and admins can delete SCORM packages" ON storage.objects;

CREATE POLICY "Admins, teachers and super admins can upload SCORM packages"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'scorm-packages'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

CREATE POLICY "Admins, teachers and super admins can update SCORM packages"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'scorm-packages'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

CREATE POLICY "Admins, teachers and super admins can delete SCORM packages"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'scorm-packages'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
);

COMMIT;