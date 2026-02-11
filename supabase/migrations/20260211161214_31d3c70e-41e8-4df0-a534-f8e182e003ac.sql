
-- Create self_assessment_questions table for auto-generated unit quizzes
CREATE TABLE public.self_assessment_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  formative_unit_id uuid NOT NULL REFERENCES public.formative_units(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  case_study text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_option_id text NOT NULL,
  explanation text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.self_assessment_questions ENABLE ROW LEVEL SECURITY;

-- Everyone enrolled can read questions
CREATE POLICY "Anyone can read active self-assessment questions"
ON public.self_assessment_questions FOR SELECT
USING (is_active = true);

-- Admin/teacher can manage questions
CREATE POLICY "Admin and teachers can manage self-assessment questions"
ON public.self_assessment_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'teacher')
  )
);

-- Index for fast lookups
CREATE INDEX idx_self_assessment_unit ON public.self_assessment_questions(formative_unit_id) WHERE is_active = true;
CREATE INDEX idx_self_assessment_course ON public.self_assessment_questions(course_id);

-- Updated_at trigger
CREATE TRIGGER update_self_assessment_questions_updated_at
BEFORE UPDATE ON public.self_assessment_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
