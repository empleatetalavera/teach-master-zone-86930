-- Tabla para almacenar calificaciones presenciales (tutorías y exámenes)
CREATE TABLE IF NOT EXISTS public.presential_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  grade_type VARCHAR(50) NOT NULL CHECK (grade_type IN ('tutoria_presencial', 'examen_presencial', 'examen_presencial_2conv')),
  score DECIMAL(5,2),
  max_score DECIMAL(5,2) DEFAULT 10,
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE,
  session_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(enrollment_id, grade_type)
);

-- Enable RLS
ALTER TABLE public.presential_grades ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Teachers and admins can view presential grades"
ON public.presential_grades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('teacher', 'admin', 'super_admin')
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Teachers and admins can insert presential grades"
ON public.presential_grades FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('teacher', 'admin', 'super_admin')
  )
);

CREATE POLICY "Teachers and admins can update presential grades"
ON public.presential_grades FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('teacher', 'admin', 'super_admin')
  )
);

CREATE POLICY "Teachers and admins can delete presential grades"
ON public.presential_grades FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('teacher', 'admin', 'super_admin')
  )
);

-- Index for faster queries
CREATE INDEX idx_presential_grades_enrollment ON public.presential_grades(enrollment_id);
CREATE INDEX idx_presential_grades_course ON public.presential_grades(course_id);
CREATE INDEX idx_presential_grades_user ON public.presential_grades(user_id);