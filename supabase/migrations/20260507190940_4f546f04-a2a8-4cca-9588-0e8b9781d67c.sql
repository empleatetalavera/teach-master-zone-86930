
ALTER TABLE public.module_scorm_content
  ADD COLUMN IF NOT EXISTS formative_unit_id uuid REFERENCES public.formative_units(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_module_scorm_content_unit ON public.module_scorm_content(formative_unit_id);

-- Reemplazar el unique para permitir el mismo paquete en varias UFs del mismo módulo
ALTER TABLE public.module_scorm_content DROP CONSTRAINT IF EXISTS module_scorm_content_module_id_scorm_package_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS module_scorm_content_module_unit_pkg_key
  ON public.module_scorm_content(module_id, COALESCE(formative_unit_id, '00000000-0000-0000-0000-000000000000'::uuid), scorm_package_id);
