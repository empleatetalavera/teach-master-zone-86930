
-- Helper: VIEW/USE semantics including central catalog assignments
CREATE OR REPLACE FUNCTION public.user_can_view_course(_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = _course_id
        AND c.training_center_id IS NOT NULL
        AND c.training_center_id = public.get_user_center_id(auth.uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      JOIN public.course_center_assignments cca ON cca.course_id = c.id
      WHERE c.id = _course_id
        AND c.training_center_id IS NULL
        AND cca.is_active = true
        AND cca.training_center_id = public.get_user_center_id(auth.uid())
    )
$$;

-- courses SELECT
DROP POLICY IF EXISTS "Users can view active courses in their center" ON public.courses;
DROP POLICY IF EXISTS "Users can view accessible courses" ON public.courses;
CREATE POLICY "Users can view accessible courses"
ON public.courses FOR SELECT TO authenticated
USING (
  is_active = true AND (
    public.has_role(auth.uid(), 'super_admin')
    OR (training_center_id IS NOT NULL AND training_center_id = public.get_user_center_id(auth.uid()))
    OR (training_center_id IS NULL AND EXISTS (
      SELECT 1 FROM public.course_center_assignments cca
      WHERE cca.course_id = courses.id
        AND cca.is_active = true
        AND cca.training_center_id = public.get_user_center_id(auth.uid())
    ))
  )
);

-- modules SELECT
DROP POLICY IF EXISTS "Users can view modules of active courses" ON public.modules;
DROP POLICY IF EXISTS "Users can view modules of accessible courses" ON public.modules;
CREATE POLICY "Users can view modules of accessible courses"
ON public.modules FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = modules.course_id AND c.is_active = true)
  AND public.user_can_view_course(modules.course_id)
);

-- evaluations SELECT
DROP POLICY IF EXISTS "Users can view active evaluations in their center" ON public.evaluations;
DROP POLICY IF EXISTS "Users can view evaluations of accessible courses" ON public.evaluations;
CREATE POLICY "Users can view evaluations of accessible courses"
ON public.evaluations FOR SELECT TO authenticated
USING (public.user_can_view_course(course_id));

-- enrollments
DROP POLICY IF EXISTS "Admins create enrollments in their center" ON public.enrollments;
DROP POLICY IF EXISTS "Teachers/admins view enrollments in their center" ON public.enrollments;
DROP POLICY IF EXISTS "Admins delete enrollments in their center" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;

CREATE POLICY "Admins create enrollments in their center"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND public.user_can_view_course(course_id)
    AND public.get_user_center_id(user_id) = public.get_user_center_id(auth.uid())
    AND public.get_user_center_id(auth.uid()) IS NOT NULL
  )
);

CREATE POLICY "Teachers/admins view enrollments in their center"
ON public.enrollments FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
    AND public.user_can_view_course(course_id)
    AND public.get_user_center_id(user_id) = public.get_user_center_id(auth.uid())
  )
);

CREATE POLICY "Admins delete enrollments in their center"
ON public.enrollments FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND public.user_can_view_course(course_id)
    AND public.get_user_center_id(user_id) = public.get_user_center_id(auth.uid())
  )
);

CREATE POLICY "Users can create their own enrollments"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.user_can_view_course(course_id));

-- course_center_assignments self-service for center admins
DROP POLICY IF EXISTS "Admins create catalog assignments for their center" ON public.course_center_assignments;
DROP POLICY IF EXISTS "Admins update catalog assignments for their center" ON public.course_center_assignments;
DROP POLICY IF EXISTS "Admins delete catalog assignments for their center" ON public.course_center_assignments;

CREATE POLICY "Admins create catalog assignments for their center"
ON public.course_center_assignments FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND training_center_id = public.get_user_center_id(auth.uid())
    AND public.get_user_center_id(auth.uid()) IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_center_assignments.course_id AND c.training_center_id IS NULL)
  )
);

CREATE POLICY "Admins update catalog assignments for their center"
ON public.course_center_assignments FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND training_center_id = public.get_user_center_id(auth.uid())
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_center_assignments.course_id AND c.training_center_id IS NULL)
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND training_center_id = public.get_user_center_id(auth.uid())
  )
);

CREATE POLICY "Admins delete catalog assignments for their center"
ON public.course_center_assignments FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND training_center_id = public.get_user_center_id(auth.uid())
    AND EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_center_assignments.course_id AND c.training_center_id IS NULL)
  )
);
