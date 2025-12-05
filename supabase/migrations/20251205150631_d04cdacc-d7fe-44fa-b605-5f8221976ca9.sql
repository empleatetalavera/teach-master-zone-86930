-- Add course_type column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS course_type text DEFAULT 'propio';

-- Add comment to explain the types
COMMENT ON COLUMN public.courses.course_type IS 'Course type: propio (own course), cfc (CFC course), certificado_profesional (Professional Certificate)';