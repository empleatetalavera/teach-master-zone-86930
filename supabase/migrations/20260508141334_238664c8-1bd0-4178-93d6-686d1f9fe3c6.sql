
-- Tabla de trazabilidad SEPE: tiempo de permanencia por recurso
CREATE TABLE IF NOT EXISTS public.resource_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID,
  course_id UUID,
  module_id UUID,
  unit_id UUID,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  resource_label TEXT,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  active_seconds INTEGER NOT NULL DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ral_user ON public.resource_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ral_course ON public.resource_access_log(course_id);
CREATE INDEX IF NOT EXISTS idx_ral_module ON public.resource_access_log(module_id);
CREATE INDEX IF NOT EXISTS idx_ral_enrollment ON public.resource_access_log(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_ral_entered ON public.resource_access_log(entered_at DESC);

ALTER TABLE public.resource_access_log ENABLE ROW LEVEL SECURITY;

-- Cada alumno gestiona sus propias filas
CREATE POLICY "users_insert_own_access_log"
  ON public.resource_access_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_access_log"
  ON public.resource_access_log FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_select_own_access_log"
  ON public.resource_access_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Tutores/admins del centro pueden leer
CREATE POLICY "staff_select_center_access_log"
  ON public.resource_access_log FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR (
      course_id IS NOT NULL
      AND public.user_can_view_course(course_id)
      AND (
        public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'teacher')
        OR public.has_role(auth.uid(), 'auditor')
      )
    )
  );

CREATE TRIGGER trg_ral_updated_at
  BEFORE UPDATE ON public.resource_access_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
