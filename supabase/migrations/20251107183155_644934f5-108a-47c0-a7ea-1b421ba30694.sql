-- Allow center admins to view and update their own training center
CREATE POLICY "Center admins can view their own center"
ON public.training_centers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.training_center_id = training_centers.id
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Center admins can update their own center"
ON public.training_centers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.training_center_id = training_centers.id
  )
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.training_center_id = training_centers.id
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);