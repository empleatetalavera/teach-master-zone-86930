-- Allow users to assign themselves the admin role (only their own user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can assign admin role to self'
  ) THEN
    CREATE POLICY "Users can assign admin role to self"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND role = 'admin');
  END IF;
END $$;