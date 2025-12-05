-- Add visibility field to modules for hidden mode
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS is_visible_to_students boolean DEFAULT true;

-- Add comment explaining the field
COMMENT ON COLUMN public.modules.is_visible_to_students IS 'When false, module is hidden from students until ready';