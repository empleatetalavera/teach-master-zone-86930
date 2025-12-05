-- Add start and end dates to modules
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;

-- Add start and end dates to formative_units
ALTER TABLE public.formative_units 
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;

-- Add course start and end dates
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;

-- Add grade breakdown setting to courses
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS enable_grade_breakdown boolean DEFAULT true;

-- Create index for date queries
CREATE INDEX IF NOT EXISTS idx_modules_dates ON public.modules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_formative_units_dates ON public.formative_units(start_date, end_date);