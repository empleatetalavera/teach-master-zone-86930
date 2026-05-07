ALTER TABLE public.training_centers
  ADD COLUMN IF NOT EXISTS navigation_guide_pdf_url text;
COMMENT ON COLUMN public.training_centers.navigation_guide_pdf_url IS
  'URL del PDF de Guía de Navegación del centro. Si NULL, se genera dinámicamente.';