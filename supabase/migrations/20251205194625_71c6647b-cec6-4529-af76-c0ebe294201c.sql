-- Add campus guide URL field to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS campus_guide_url text;