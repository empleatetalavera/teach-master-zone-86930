-- Enable first-user bootstrap for roles
CREATE OR REPLACE FUNCTION public.no_roles_exist()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles);
$$;

-- Allow the very first authenticated user to insert their own role
DROP POLICY IF EXISTS "First user can bootstrap admin role" ON public.user_roles;
CREATE POLICY "First user can bootstrap admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.no_roles_exist() AND auth.uid() = user_id);
