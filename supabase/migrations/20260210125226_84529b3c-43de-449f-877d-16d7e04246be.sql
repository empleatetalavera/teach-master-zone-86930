
-- Allow teachers to manage SEPE certificates
DROP POLICY IF EXISTS "Admins can view all SEPE certificates" ON public.sepe_certificates;
CREATE POLICY "Admins and teachers can view all SEPE certificates"
  ON public.sepe_certificates FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'teacher'));

DROP POLICY IF EXISTS "Admins can insert SEPE certificates" ON public.sepe_certificates;
CREATE POLICY "Admins and teachers can insert SEPE certificates"
  ON public.sepe_certificates FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'teacher'));

DROP POLICY IF EXISTS "Admins can update SEPE certificates" ON public.sepe_certificates;
CREATE POLICY "Admins and teachers can update SEPE certificates"
  ON public.sepe_certificates FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'teacher'));

DROP POLICY IF EXISTS "Admins can delete SEPE certificates" ON public.sepe_certificates;
CREATE POLICY "Admins and teachers can delete SEPE certificates"
  ON public.sepe_certificates FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'teacher'));

-- Storage policies for teachers
DROP POLICY IF EXISTS "Admins can upload SEPE certificates" ON storage.objects;
CREATE POLICY "Admins and teachers can upload SEPE certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sepe-certificates' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'teacher')));

DROP POLICY IF EXISTS "Admins can view SEPE certificates storage" ON storage.objects;
CREATE POLICY "Admins and teachers can view SEPE certificates storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sepe-certificates' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'teacher')));

DROP POLICY IF EXISTS "Admins can delete SEPE certificates storage" ON storage.objects;
CREATE POLICY "Admins and teachers can delete SEPE certificates storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sepe-certificates' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'teacher')));
