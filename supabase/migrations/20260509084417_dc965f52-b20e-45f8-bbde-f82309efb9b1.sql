ALTER TABLE public.training_centers
  ADD COLUMN IF NOT EXISTS student_guide_pdf_url text,
  ADD COLUMN IF NOT EXISTS tutor_guide_pdf_url text;

COMMENT ON COLUMN public.training_centers.student_guide_pdf_url IS 'URL del PDF de la Guía del Alumno propia del centro (independiente del curso)';
COMMENT ON COLUMN public.training_centers.tutor_guide_pdf_url IS 'URL del PDF de la Guía del Tutor propia del centro (independiente del curso)';