-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view their center assignments" ON course_center_assignments;
DROP POLICY IF EXISTS "Super admins can manage course assignments" ON course_center_assignments;

-- Create permissive policies instead
CREATE POLICY "Super admins can manage course assignments" 
ON course_center_assignments 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin'
  )
);

CREATE POLICY "Admins can view their center assignments" 
ON course_center_assignments 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
  AND training_center_id IN (
    SELECT profiles.training_center_id 
    FROM profiles 
    WHERE profiles.id = auth.uid()
  )
);