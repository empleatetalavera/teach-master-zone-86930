-- Ensure RLS is enabled on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow first-ever role insertion (bootstrap) when there are no roles yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Bootstrap first role'
  ) THEN
    CREATE POLICY "Bootstrap first role"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.no_roles_exist());
  END IF;
END $$;

-- Allow users to assign themselves the teacher role (only their own user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can assign teacher role to self'
  ) THEN
    CREATE POLICY "Users can assign teacher role to self"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND role = 'teacher');
  END IF;
END $$;