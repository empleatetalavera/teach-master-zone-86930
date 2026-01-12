-- Add columns for official certificate documents (ficha and BOE)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS ficha_certificado_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS boe_url TEXT DEFAULT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN public.courses.ficha_certificado_url IS 'URL of the official certificate sheet (ficha del certificado de profesionalidad)';
COMMENT ON COLUMN public.courses.boe_url IS 'URL of the BOE document for this certificate';