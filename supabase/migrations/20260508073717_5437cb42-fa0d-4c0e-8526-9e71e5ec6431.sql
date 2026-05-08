
-- Tighten enrollments RLS to prevent cross-tenant inscriptions

-- 1) Delete existing cross-tenant enrollments
DELETE FROM public.enrollments e
USING public.courses c, public.profiles p
WHERE e.course_id = c.id
  AND e.user_id = p.id
  AND p.training_center_id IS NOT NULL
  AND c.training_center_id IS NOT NULL
  AND c.training_center_id IS DISTINCT FROM p.training_center_id;

-- 2) Drop existing policies (real names confirmed via pg_policies)
DROP POLICY IF EXISTS "Admins create enrollments in their center" ON public.enrollments;
DROP POLICY IF EXISTS "Admins delete enrollments in their center" ON public.enrollments;
DROP POLICY IF EXISTS "Teachers/admins view enrollments in their center" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;

-- 3) Recreate with tenant-isolation checks
-- Admin/super_admin INSERT: course must be accessible AND target user must belong to same center (or super_admin bypass)
CREATE POLICY "Admins create enrollments in their center"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  (
    has_role(auth.uid(), 'super_admin'::app_role)
  )
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND public.user_can_access_course(course_id)
    AND public.get_user_center_id(user_id) IS NOT DISTINCT FROM public.get_user_center_id(auth.uid())
    AND public.get_user_center_id(user_id) IS NOT NULL
  )
);

-- Admin/super_admin DELETE
CREATE POLICY "Admins delete enrollments in their center"
ON public.enrollments
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND public.user_can_access_course(course_id)
  )
);

-- Teachers/admins SELECT
CREATE POLICY "Teachers/admins view enrollments in their center"
ON public.enrollments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND public.user_can_access_course(course_id)
  )
);

-- Self-enrollment: only into a course of the same center
CREATE POLICY "Users can create their own enrollments"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.user_can_access_course(course_id)
);
