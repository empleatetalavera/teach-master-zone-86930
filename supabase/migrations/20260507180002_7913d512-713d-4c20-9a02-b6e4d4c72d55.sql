
BEGIN;

DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view active evaluations" ON public.evaluations;

CREATE POLICY "Users can view active courses in their center"
ON public.courses FOR SELECT TO authenticated
USING (
  is_active = true
  AND training_center_id = get_user_center_id(auth.uid())
);

CREATE POLICY "Users can view active evaluations in their center"
ON public.evaluations FOR SELECT TO authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = evaluations.course_id
      AND c.training_center_id = get_user_center_id(auth.uid())
  )
);

COMMIT;
