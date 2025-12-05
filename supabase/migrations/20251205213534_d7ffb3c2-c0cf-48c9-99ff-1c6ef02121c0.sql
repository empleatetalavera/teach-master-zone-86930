-- Create table for formative unit interactive content
CREATE TABLE public.unit_interactive_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formative_unit_id UUID NOT NULL REFERENCES public.formative_units(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document', 'audio', 'scorm', 'exercise', 'presentation')),
  title TEXT NOT NULL,
  description TEXT,
  content_url TEXT,
  file_path TEXT,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unit_interactive_content ENABLE ROW LEVEL SECURITY;

-- Policies for viewing content (enrolled students, teachers, admins)
CREATE POLICY "Users can view unit content" 
ON public.unit_interactive_content 
FOR SELECT 
USING (true);

-- Policies for managing content (teachers, admins)
CREATE POLICY "Teachers and admins can manage unit content" 
ON public.unit_interactive_content 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('teacher', 'admin', 'super_admin')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_unit_interactive_content_updated_at
BEFORE UPDATE ON public.unit_interactive_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for tracking user progress on interactive content
CREATE TABLE public.unit_content_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES public.unit_interactive_content(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  last_position TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id, enrollment_id)
);

-- Enable RLS
ALTER TABLE public.unit_content_progress ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own progress
CREATE POLICY "Users can manage their own progress" 
ON public.unit_content_progress 
FOR ALL 
USING (auth.uid() = user_id);

-- Teachers and admins can view all progress
CREATE POLICY "Teachers can view all progress" 
ON public.unit_content_progress 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('teacher', 'admin', 'super_admin', 'auditor')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_unit_content_progress_updated_at
BEFORE UPDATE ON public.unit_content_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();