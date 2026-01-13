-- Add new columns for enhanced slide content
ALTER TABLE public.unit_syllabus_slides 
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS objectives jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS buttons jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS highlight_boxes jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.unit_syllabus_slides.images IS 'Array of image objects: [{url, alt, caption}]';
COMMENT ON COLUMN public.unit_syllabus_slides.objectives IS 'Array of objective strings for learning goals';
COMMENT ON COLUMN public.unit_syllabus_slides.buttons IS 'Array of button objects: [{label, url, variant}]';
COMMENT ON COLUMN public.unit_syllabus_slides.highlight_boxes IS 'Array of highlight box objects: [{type, title, content}] - types: info, warning, tip, important';