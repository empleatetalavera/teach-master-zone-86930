-- Add video_url, objectives and other intro fields to courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS objectives text,
ADD COLUMN IF NOT EXISTS specific_objectives jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS concept_map_url text;

-- Add support contact info to courses
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS support_email text,
ADD COLUMN IF NOT EXISTS support_phone text,
ADD COLUMN IF NOT EXISTS tutor_id uuid REFERENCES auth.users(id);

-- Create index for tutor lookups
CREATE INDEX IF NOT EXISTS idx_courses_tutor ON public.courses(tutor_id);