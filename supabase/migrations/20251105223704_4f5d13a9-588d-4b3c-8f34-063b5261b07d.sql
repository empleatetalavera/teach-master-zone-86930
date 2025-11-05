-- Add tutor_cv_url field to courses table for SEPE compliance
ALTER TABLE public.courses
ADD COLUMN tutor_cv_url text;