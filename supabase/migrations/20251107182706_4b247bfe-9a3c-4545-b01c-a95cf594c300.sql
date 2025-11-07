-- Add training_center_id to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS training_center_id UUID REFERENCES public.training_centers(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_training_center 
ON public.profiles(training_center_id);

-- Add training_center_id to user_roles table for easier queries
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS training_center_id UUID REFERENCES public.training_centers(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_roles_training_center 
ON public.user_roles(training_center_id);

-- Update RLS policies to allow users to view their center info
CREATE POLICY "Users can view their training center"
ON public.training_centers
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT training_center_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
  OR is_active = TRUE
);