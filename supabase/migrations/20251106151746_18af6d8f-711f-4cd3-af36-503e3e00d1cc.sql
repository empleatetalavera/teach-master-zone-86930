-- Create live_sessions table for Adobe Connect integration
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_url TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  recording_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view sessions for courses they're enrolled in
CREATE POLICY "Students can view sessions for enrolled courses"
  ON public.live_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.course_id = live_sessions.course_id
      AND enrollments.user_id = auth.uid()
    )
  );

-- Policy: Teachers and admins can manage all sessions
CREATE POLICY "Teachers and admins can manage sessions"
  ON public.live_sessions
  FOR ALL
  USING (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create index for performance
CREATE INDEX idx_live_sessions_course_id ON public.live_sessions(course_id);
CREATE INDEX idx_live_sessions_scheduled_date ON public.live_sessions(scheduled_date);
CREATE INDEX idx_live_sessions_status ON public.live_sessions(status);

-- Create trigger for updated_at
CREATE TRIGGER update_live_sessions_updated_at
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();