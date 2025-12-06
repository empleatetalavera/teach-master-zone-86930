-- Create table for tutor guide content per course
CREATE TABLE public.tutor_guide_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  section_title text NOT NULL,
  content text,
  resources jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(course_id, section_key)
);

-- Enable RLS
ALTER TABLE public.tutor_guide_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins and super_admins can manage tutor guide sections"
ON public.tutor_guide_sections
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Teachers can view tutor guide sections for their courses"
ON public.tutor_guide_sections
FOR SELECT
USING (
  has_role(auth.uid(), 'teacher'::app_role) AND
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = tutor_guide_sections.course_id 
    AND courses.tutor_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_tutor_guide_sections_updated_at
BEFORE UPDATE ON public.tutor_guide_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_tutor_guide_sections_course_id ON public.tutor_guide_sections(course_id);