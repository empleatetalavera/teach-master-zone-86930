CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT, p_center_slug TEXT DEFAULT NULL)
RETURNS TABLE(email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_center_slug IS NOT NULL THEN
    RETURN QUERY
    SELECT u.email::TEXT
    FROM auth.users u
    INNER JOIN public.profiles p ON p.id = u.id
    INNER JOIN public.training_centers tc ON tc.id = p.training_center_id
    WHERE LOWER(p.username) = LOWER(p_username)
      AND LOWER(tc.slug) = LOWER(p_center_slug)
    LIMIT 1;
  ELSE
    RETURN QUERY
    SELECT u.email::TEXT
    FROM auth.users u
    INNER JOIN public.profiles p ON p.id = u.id
    WHERE LOWER(p.username) = LOWER(p_username)
    LIMIT 1;
  END IF;
END;
$$;