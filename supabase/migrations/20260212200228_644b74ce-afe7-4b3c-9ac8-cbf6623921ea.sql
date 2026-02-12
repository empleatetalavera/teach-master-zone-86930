
-- Fix: add WITH CHECK to allow teachers/admins to insert activities
DROP POLICY "Teachers can manage activities" ON public.development_activities;

CREATE POLICY "Teachers can manage activities"
ON public.development_activities
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
