-- Add custom_domain field to training_centers for custom aula URLs
ALTER TABLE public.training_centers
ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- Add index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_training_centers_custom_domain ON public.training_centers(custom_domain);

-- Add comment
COMMENT ON COLUMN public.training_centers.custom_domain IS 'Custom domain URL for the training center aula (e.g., https://aula.micentro.es)';