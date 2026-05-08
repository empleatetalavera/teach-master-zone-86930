CREATE OR REPLACE VIEW public.centers_public_branding
WITH (security_invoker = false)
AS
SELECT 
  id,
  name,
  custom_domain,
  logo_url,
  primary_color,
  secondary_color,
  official_badge,
  footer_text
FROM public.training_centers
WHERE is_active = true;

GRANT SELECT ON public.centers_public_branding TO anon;
GRANT SELECT ON public.centers_public_branding TO authenticated;