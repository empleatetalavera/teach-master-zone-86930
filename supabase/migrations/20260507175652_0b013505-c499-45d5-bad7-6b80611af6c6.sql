
BEGIN;

-- ============== profiles ==============
DROP POLICY IF EXISTS "Users cannot browse other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.profiles;

CREATE POLICY "Admins and teachers can view profiles in their center"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'teacher'::app_role))
  AND training_center_id IS NOT NULL
  AND training_center_id = public.get_user_center_id(auth.uid())
);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update profiles in their center"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND training_center_id IS NOT NULL
  AND training_center_id = public.get_user_center_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND training_center_id IS NOT NULL
  AND training_center_id = public.get_user_center_id(auth.uid())
);

CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- ============== training_centers ==============
DROP POLICY IF EXISTS "Admins can manage training centers" ON public.training_centers;
DROP POLICY IF EXISTS "Everyone can view active training centers" ON public.training_centers;
DROP POLICY IF EXISTS "Users can view their training center" ON public.training_centers;

CREATE POLICY "Users can view their own center"
ON public.training_centers
FOR SELECT
TO authenticated
USING (id = public.get_user_center_id(auth.uid()));

-- ============== user_roles ==============
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Bootstrap first role" ON public.user_roles;

CREATE POLICY "Admins can manage roles in their center"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_roles.user_id
      AND p.training_center_id = public.get_user_center_id(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_roles.user_id
      AND p.training_center_id = public.get_user_center_id(auth.uid())
  )
);

COMMIT;
