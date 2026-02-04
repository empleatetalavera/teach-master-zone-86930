-- Add fields for dynamic course configuration (applicable to all courses)
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS course_code TEXT,
  ADD COLUMN IF NOT EXISTS professional_family TEXT,
  ADD COLUMN IF NOT EXISTS qualification_level INTEGER,
  ADD COLUMN IF NOT EXISTS modality TEXT DEFAULT 'teleformacion',
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'ESTATAL',
  ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS presential_hours INTEGER,
  ADD COLUMN IF NOT EXISTS internship_hours INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN public.courses.course_code IS 'Official certification code (e.g., ADGG0408)';
COMMENT ON COLUMN public.courses.professional_family IS 'Professional family (e.g., Administración y Gestión)';
COMMENT ON COLUMN public.courses.qualification_level IS 'Qualification level (1, 2, or 3)';
COMMENT ON COLUMN public.courses.modality IS 'Course modality: teleformacion, presencial, mixta';
COMMENT ON COLUMN public.courses.scope IS 'Geographic scope: ESTATAL, AUTONOMICO';
COMMENT ON COLUMN public.courses.max_students IS 'Maximum number of students';
COMMENT ON COLUMN public.courses.presential_hours IS 'Hours of presential tutorials';
COMMENT ON COLUMN public.courses.internship_hours IS 'Hours of professional internships (prácticas)';