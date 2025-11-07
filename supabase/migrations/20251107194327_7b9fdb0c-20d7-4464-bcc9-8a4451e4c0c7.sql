
-- Add slug field to training_centers for unique URL identification
ALTER TABLE public.training_centers
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_training_centers_slug ON public.training_centers(slug);

-- Add comment
COMMENT ON COLUMN public.training_centers.slug IS 'Unique URL-friendly identifier for the training center (e.g., grupoarma)';
