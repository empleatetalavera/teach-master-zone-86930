-- Drop the global unique index on username
DROP INDEX IF EXISTS public.profiles_username_unique;

-- Create a new unique index scoped to training_center_id
CREATE UNIQUE INDEX profiles_username_center_unique 
ON public.profiles (training_center_id, lower((username)::text)) 
WHERE (username IS NOT NULL AND training_center_id IS NOT NULL);