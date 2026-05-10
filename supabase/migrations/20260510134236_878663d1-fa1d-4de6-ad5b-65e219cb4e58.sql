CREATE TABLE public.student_item_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('activity','quiz')),
  item_id uuid NOT NULL,
  course_id uuid,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT student_item_completions_unique UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX idx_student_item_completions_user ON public.student_item_completions(user_id);
CREATE INDEX idx_student_item_completions_item ON public.student_item_completions(item_type, item_id);

ALTER TABLE public.student_item_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own completions"
ON public.student_item_completions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Students insert own completions"
ON public.student_item_completions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students delete own completions"
ON public.student_item_completions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins view completions in their center"
ON public.student_item_completions FOR SELECT
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = student_item_completions.user_id
      AND p.training_center_id = (SELECT training_center_id FROM public.profiles WHERE id = auth.uid())
  )
);