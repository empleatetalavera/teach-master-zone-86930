DROP POLICY IF EXISTS "Admins and teachers can manage module content" ON public.module_content;

CREATE POLICY "Admins and teachers can manage module content"
ON public.module_content
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::app_role, 'super_admin'::app_role, 'teacher'::app_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = ANY (ARRAY['admin'::app_role, 'super_admin'::app_role, 'teacher'::app_role])
  )
);