-- Create table for SíOnline integration settings
CREATE TABLE public.sionline_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_center_id UUID NOT NULL REFERENCES public.training_centers(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  url_seguimiento TEXT,
  credenciales_seguimiento TEXT,
  api_key TEXT,
  fecha_alta TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_renovacion TIMESTAMP WITH TIME ZONE,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('activo', 'pendiente', 'inactivo', 'vencido')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(training_center_id)
);

-- Create table for global SíOnline account (super admin)
CREATE TABLE public.sionline_global_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  password_hash TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  precio_trimestral NUMERIC DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sionline_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sionline_global_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for sionline_settings
CREATE POLICY "Super admins can manage all sionline settings"
ON public.sionline_settings
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Center admins can view their own sionline settings"
ON public.sionline_settings
FOR SELECT
USING (
  training_center_id IN (
    SELECT training_center_id FROM profiles WHERE id = auth.uid()
  ) AND has_role(auth.uid(), 'admin'::app_role)
);

-- RLS policies for sionline_global_config
CREATE POLICY "Only super admins can manage global sionline config"
ON public.sionline_global_config
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_sionline_settings_updated_at
BEFORE UPDATE ON public.sionline_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sionline_global_config_updated_at
BEFORE UPDATE ON public.sionline_global_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();