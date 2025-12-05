-- Drop dangerous self-assignment policies that allow privilege escalation
DROP POLICY IF EXISTS "Users can assign admin role to self" ON public.user_roles;
DROP POLICY IF EXISTS "Users can assign teacher role to self" ON public.user_roles;

-- Ensure only admins and super_admins can manage roles (through edge functions with service role)
-- Keep existing policies that are safe:
-- - "Admin users can view all roles" (SELECT only)
-- - "Admin users can manage roles" (ALL for admins)
-- - "Users can view their own role" (SELECT own role only)