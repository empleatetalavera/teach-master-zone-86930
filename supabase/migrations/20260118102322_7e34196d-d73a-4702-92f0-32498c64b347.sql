-- Add username column to profiles for login flexibility
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- Create unique index on username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (LOWER(username)) WHERE username IS NOT NULL;

-- Create a function to find email by username
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TABLE(email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.email::TEXT
  FROM auth.users u
  INNER JOIN public.profiles p ON p.id = u.id
  WHERE LOWER(p.username) = LOWER(p_username)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;