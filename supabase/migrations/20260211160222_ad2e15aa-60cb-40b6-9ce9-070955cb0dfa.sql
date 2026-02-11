-- Add formative_unit_id to module_content for per-unit PDF filtering
ALTER TABLE public.module_content 
ADD COLUMN formative_unit_id uuid REFERENCES public.formative_units(id) ON DELETE SET NULL;

-- Index for efficient lookups
CREATE INDEX idx_module_content_formative_unit ON public.module_content(formative_unit_id) WHERE formative_unit_id IS NOT NULL;