-- Create table for course-center assignments (catalog system)
CREATE TABLE public.course_center_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  training_center_id UUID NOT NULL REFERENCES public.training_centers(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(course_id, training_center_id)
);

-- Enable RLS
ALTER TABLE public.course_center_assignments ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all assignments
CREATE POLICY "Super admins can manage course assignments"
ON public.course_center_assignments
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can view assignments for their center
CREATE POLICY "Admins can view their center assignments"
ON public.course_center_assignments
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) AND
  training_center_id IN (
    SELECT training_center_id FROM profiles WHERE id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX idx_course_center_assignments_course ON public.course_center_assignments(course_id);
CREATE INDEX idx_course_center_assignments_center ON public.course_center_assignments(training_center_id);