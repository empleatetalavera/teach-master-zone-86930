
CREATE TABLE public.student_evidences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES public.formative_units(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_evidences_user ON public.student_evidences(user_id, course_id);
CREATE INDEX idx_student_evidences_course ON public.student_evidences(course_id);
CREATE INDEX idx_student_evidences_module ON public.student_evidences(module_id);
CREATE INDEX idx_student_evidences_unit ON public.student_evidences(unit_id);

ALTER TABLE public.student_evidences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evidences: owner or staff in center can view"
ON public.student_evidences FOR SELECT
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), 'auditor')
  OR (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
    AND user_id IN (
      SELECT id FROM public.profiles
      WHERE training_center_id = public.get_user_training_center()
    )
  )
);

CREATE POLICY "Evidences: insert by self"
ON public.student_evidences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Evidences: update by self or staff"
ON public.student_evidences FOR UPDATE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
    AND user_id IN (
      SELECT id FROM public.profiles
      WHERE training_center_id = public.get_user_training_center()
    )
  )
);

CREATE POLICY "Evidences: delete by self or admin"
ON public.student_evidences FOR DELETE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND user_id IN (
      SELECT id FROM public.profiles
      WHERE training_center_id = public.get_user_training_center()
    )
  )
);

CREATE TRIGGER update_student_evidences_updated_at
BEFORE UPDATE ON public.student_evidences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Evidences storage: users upload own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'evidences'
);

CREATE POLICY "Evidences storage: users read own or staff"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'auditor')
    OR (
      (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
      AND (storage.foldername(name))[2] = 'evidences'
    )
  )
);

CREATE POLICY "Evidences storage: users delete own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] = 'evidences'
);
