
-- Table to store SEPE test actions during validation
CREATE TABLE public.sepe_acciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_cif TEXT NOT NULL,
  origen_accion TEXT NOT NULL,
  codigo_accion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(center_cif, origen_accion, codigo_accion)
);

-- Enable RLS
ALTER TABLE public.sepe_acciones ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge function uses service role)
CREATE POLICY "Service role full access" ON public.sepe_acciones
  FOR ALL USING (true) WITH CHECK (true);
