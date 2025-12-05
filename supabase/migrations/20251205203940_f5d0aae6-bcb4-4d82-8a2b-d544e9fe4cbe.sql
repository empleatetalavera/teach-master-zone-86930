-- Create formative units table (unidades formativas) as children of modules
CREATE TABLE public.formative_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  objectives text,
  order_index integer NOT NULL DEFAULT 1,
  duration_hours numeric(4,1) DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.formative_units ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins and teachers can manage formative units"
ON public.formative_units FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Users can view formative units of active modules"
ON public.formative_units FOR SELECT
USING (EXISTS (
  SELECT 1 FROM modules m
  JOIN courses c ON c.id = m.course_id
  WHERE m.id = formative_units.module_id
  AND m.is_active = true
  AND c.is_active = true
));

CREATE POLICY "Auditors can view all formative units"
ON public.formative_units FOR SELECT
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Create index for faster queries
CREATE INDEX idx_formative_units_module_id ON public.formative_units(module_id);

-- Trigger for updated_at
CREATE TRIGGER update_formative_units_updated_at
  BEFORE UPDATE ON public.formative_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();