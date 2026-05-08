-- =====================================================================
-- MIGRACIÓN: Sistema de preguntas para evaluaciones
-- Fecha: 2026-05-08
-- Descripción: Añade la tabla evaluation_questions que almacena las preguntas
-- de cada evaluación, sus opciones y respuestas correctas.
-- =====================================================================

-- 1. Tabla de preguntas de evaluación
CREATE TABLE IF NOT EXISTS public.evaluation_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluation_id uuid NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'single_choice')),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text,
  points numeric NOT NULL DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Índices para optimizar consultas por evaluación
CREATE INDEX IF NOT EXISTS idx_evaluation_questions_evaluation_id 
  ON public.evaluation_questions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_questions_order 
  ON public.evaluation_questions(evaluation_id, order_index);

-- 3. Habilitar Row Level Security
ALTER TABLE public.evaluation_questions ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS

-- Los alumnos matriculados pueden ver las preguntas de las evaluaciones de sus cursos
CREATE POLICY "Enrolled students can view questions"
ON public.evaluation_questions FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM public.evaluations e
    INNER JOIN public.enrollments en ON en.course_id = e.course_id
    WHERE e.id = evaluation_questions.evaluation_id
    AND en.user_id = auth.uid()
  )
);

-- Admin, super_admin y teacher pueden gestionar preguntas
CREATE POLICY "Admin and teachers can manage questions"
ON public.evaluation_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'teacher')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'teacher')
  )
);

-- Los auditores pueden ver todas las preguntas (para inspección SEPE)
CREATE POLICY "Auditors can view all questions"
ON public.evaluation_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'auditor'
  )
);

-- 5. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_evaluation_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_evaluation_questions_updated_at ON public.evaluation_questions;
CREATE TRIGGER update_evaluation_questions_updated_at
  BEFORE UPDATE ON public.evaluation_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_evaluation_questions_updated_at();

-- =====================================================================
-- NOTA SOBRE EL FORMATO DE OPTIONS:
-- 
-- Para preguntas multiple_choice o single_choice, options debe ser:
-- [
--   {"id": "a", "text": "Opción A"},
--   {"id": "b", "text": "Opción B"},
--   {"id": "c", "text": "Opción C"},
--   {"id": "d", "text": "Opción D"}
-- ]
-- Y correct_answer = "a" (o el id correspondiente)
--
-- Para preguntas true_false, options puede estar vacío []
-- Y correct_answer = "true" o "false"
-- =====================================================================