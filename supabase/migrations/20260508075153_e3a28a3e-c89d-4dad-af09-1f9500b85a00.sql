-- Reemplazar SELECT de course_center_assignments para abrir a todos los usuarios autenticados del centro
DROP POLICY IF EXISTS "Admins can view their center assignments" ON public.course_center_assignments;

CREATE POLICY "Users view assignments of their center"
ON public.course_center_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR training_center_id = public.get_user_center_id(auth.uid())
);