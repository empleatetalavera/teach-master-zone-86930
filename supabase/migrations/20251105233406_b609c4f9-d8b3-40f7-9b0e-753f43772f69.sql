
-- Create teacher_profiles table to store professional information
CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specializations JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  experience_years INTEGER DEFAULT 0,
  education TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view and edit their own profile
CREATE POLICY "Teachers can manage their own profile"
ON public.teacher_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all teacher profiles
CREATE POLICY "Admins can view all teacher profiles"
ON public.teacher_profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Authenticated users can view teacher profiles (for course info, etc.)
CREATE POLICY "Authenticated users can view teacher profiles"
ON public.teacher_profiles
FOR SELECT
TO authenticated
USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_teacher_profiles_updated_at
BEFORE UPDATE ON public.teacher_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_teacher_profiles_user_id ON public.teacher_profiles(user_id);
