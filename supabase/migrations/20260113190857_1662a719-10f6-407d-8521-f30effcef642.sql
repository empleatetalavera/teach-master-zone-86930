-- Create unit_progress table for tracking completion percentage per formative unit
CREATE TABLE public.unit_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  formative_unit_id UUID NOT NULL REFERENCES public.formative_units(id) ON DELETE CASCADE,
  content_progress INTEGER DEFAULT 0, -- Percentage of interactive content completed (0-100)
  activities_progress INTEGER DEFAULT 0, -- Percentage of activities completed (0-100)
  overall_progress INTEGER DEFAULT 0, -- Combined overall progress
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_unit_progress UNIQUE (enrollment_id, formative_unit_id)
);

-- Enable RLS
ALTER TABLE public.unit_progress ENABLE ROW LEVEL SECURITY;

-- Students can view their own progress
CREATE POLICY "Users can view their own unit progress"
ON public.unit_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Students can insert their own progress
CREATE POLICY "Users can insert their own unit progress"
ON public.unit_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can update their own progress
CREATE POLICY "Users can update their own unit progress"
ON public.unit_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Teachers and admins can view all progress (for their courses)
CREATE POLICY "Teachers and admins can view all unit progress"
ON public.unit_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'teacher')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_unit_progress_updated_at
BEFORE UPDATE ON public.unit_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();