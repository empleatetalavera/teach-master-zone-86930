-- Add policy for super_admin to manage training centers
CREATE POLICY "Super admins can manage training centers"
ON public.training_centers
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));