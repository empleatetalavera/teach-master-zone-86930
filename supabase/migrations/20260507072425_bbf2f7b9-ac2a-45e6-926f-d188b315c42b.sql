
CREATE TABLE IF NOT EXISTS public.self_assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  formative_unit_id uuid NOT NULL,
  score numeric(5,2) NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  total_count integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'completed',
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saa_user_unit ON public.self_assessment_attempts(user_id, formative_unit_id);
CREATE INDEX IF NOT EXISTS idx_saa_course ON public.self_assessment_attempts(course_id);

ALTER TABLE public.self_assessment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own attempts"
  ON public.self_assessment_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own attempts"
  ON public.self_assessment_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own attempts"
  ON public.self_assessment_attempts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff view all attempts"
  ON public.self_assessment_attempts FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER trg_saa_updated_at
  BEFORE UPDATE ON public.self_assessment_attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
