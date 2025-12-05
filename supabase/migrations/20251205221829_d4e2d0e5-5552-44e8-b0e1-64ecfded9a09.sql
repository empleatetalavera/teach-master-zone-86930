-- Drop existing policies and recreate with super_admin included
DROP POLICY IF EXISTS "Admins and teachers can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Admins and teachers can manage formative units" ON public.formative_units;

-- Create updated policies including super_admin
CREATE POLICY "Admins and teachers can manage modules" 
ON public.modules 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins and teachers can manage formative units" 
ON public.formative_units 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);