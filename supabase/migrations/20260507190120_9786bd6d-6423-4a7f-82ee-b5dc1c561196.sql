CREATE POLICY "Public can view active centers for branding"
ON public.training_centers
FOR SELECT
TO anon, authenticated
USING (is_active = true);