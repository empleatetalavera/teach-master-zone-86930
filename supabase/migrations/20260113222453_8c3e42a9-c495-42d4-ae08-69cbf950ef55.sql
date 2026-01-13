-- Drop existing restrictive UPDATE policies for profiles
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new policy that allows admins and super_admins to update any profile
-- and allows users to update their own profile
CREATE POLICY "Users and admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);