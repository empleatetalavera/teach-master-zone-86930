ALTER TABLE public.training_centers 
ADD COLUMN IF NOT EXISTS representative_name text,
ADD COLUMN IF NOT EXISTS representative_position text,
ADD COLUMN IF NOT EXISTS mercantile_registry text;