-- Allow admins and teachers to create enrollments for any user
CREATE POLICY "Admins can create enrollments for any user" 
ON public.enrollments 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Allow admins and teachers to delete enrollments
CREATE POLICY "Admins can delete enrollments" 
ON public.enrollments 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);