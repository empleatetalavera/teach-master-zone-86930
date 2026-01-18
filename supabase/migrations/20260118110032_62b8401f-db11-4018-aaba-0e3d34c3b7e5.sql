-- Add tutor_guide_pdf_url field to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS tutor_guide_pdf_url TEXT;