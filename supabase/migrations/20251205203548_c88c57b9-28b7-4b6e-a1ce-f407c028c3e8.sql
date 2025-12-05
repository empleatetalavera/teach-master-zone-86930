-- Add new fields to modules table for concept map, objectives, and forum
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS concept_map_url text,
ADD COLUMN IF NOT EXISTS objectives text,
ADD COLUMN IF NOT EXISTS forum_enabled boolean DEFAULT true;

-- Add a comment for clarity
COMMENT ON COLUMN public.modules.concept_map_url IS 'URL or path to the concept map file/image';
COMMENT ON COLUMN public.modules.objectives IS 'Learning objectives for this module';
COMMENT ON COLUMN public.modules.forum_enabled IS 'Whether the forum is enabled for this module';