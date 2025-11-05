-- Tabla de eventos del calendario (fechas importantes, tutorías, entregas)
CREATE TABLE IF NOT EXISTS public.course_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('tutoria', 'entrega', 'examen', 'clase', 'otro')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  meeting_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_mandatory BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false
);

-- Tabla de asistencia a eventos
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.course_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'attended', 'absent', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Tabla de foros de discusión
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de respuestas en foros
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de actividades de desarrollo (ensayos, proyectos, tareas)
CREATE TABLE IF NOT EXISTS public.development_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  max_score NUMERIC(5,2) DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  allow_late_submission BOOLEAN DEFAULT false,
  late_penalty_percentage NUMERIC(5,2) DEFAULT 0,
  submission_type VARCHAR(50) DEFAULT 'file' CHECK (submission_type IN ('file', 'text', 'url', 'both')),
  max_file_size_mb INTEGER DEFAULT 10,
  allowed_file_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de entregas de actividades
CREATE TABLE IF NOT EXISTS public.activity_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.development_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  submission_text TEXT,
  submission_url TEXT,
  file_path TEXT,
  file_name VARCHAR(255),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  score NUMERIC(5,2),
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned', 'late')),
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(activity_id, user_id, attempt_number)
);

-- Tabla de seguimiento de contacto profesor-alumno
CREATE TABLE IF NOT EXISTS public.teacher_student_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  student_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN ('tutoria', 'mensaje', 'feedback', 'seguimiento', 'llamada', 'otro')),
  subject VARCHAR(255) NOT NULL,
  notes TEXT NOT NULL,
  duration_minutes INTEGER,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_course_events_course ON public.course_events(course_id, start_time);
CREATE INDEX idx_event_attendance_user ON public.event_attendance(user_id, status);
CREATE INDEX idx_forum_topics_course ON public.forum_topics(course_id, created_at DESC);
CREATE INDEX idx_forum_replies_topic ON public.forum_replies(topic_id, created_at);
CREATE INDEX idx_development_activities_course ON public.development_activities(course_id, due_date);
CREATE INDEX idx_activity_submissions_user ON public.activity_submissions(user_id, status);
CREATE INDEX idx_teacher_contacts_student ON public.teacher_student_contacts(student_id, created_at DESC);

-- Triggers para updated_at
CREATE TRIGGER update_course_events_updated_at BEFORE UPDATE ON public.course_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_attendance_updated_at BEFORE UPDATE ON public.event_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_development_activities_updated_at BEFORE UPDATE ON public.development_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_submissions_updated_at BEFORE UPDATE ON public.activity_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teacher_contacts_updated_at BEFORE UPDATE ON public.teacher_student_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.course_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student_contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para course_events
CREATE POLICY "Teachers and admins can manage events" ON public.course_events
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Students can view events of their courses" ON public.course_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_events.course_id AND e.user_id = auth.uid()
    )
  );

-- Políticas para event_attendance
CREATE POLICY "Users can manage their own attendance" ON public.event_attendance
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all attendance" ON public.event_attendance
  FOR SELECT USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Políticas para forum_topics
CREATE POLICY "Enrolled users can view forum topics" ON public.forum_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = forum_topics.course_id AND e.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Enrolled users can create topics" ON public.forum_topics
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    (EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = forum_topics.course_id AND e.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can edit their own topics" ON public.forum_topics
  FOR UPDATE USING (auth.uid() = created_by OR has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Políticas para forum_replies
CREATE POLICY "Users can view replies" ON public.forum_replies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forum_topics ft
      JOIN public.enrollments e ON e.course_id = ft.course_id
      WHERE ft.id = forum_replies.topic_id AND e.user_id = auth.uid()
    ) OR has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can edit their own replies" ON public.forum_replies
  FOR UPDATE USING (auth.uid() = created_by OR has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Políticas para development_activities
CREATE POLICY "Teachers can manage activities" ON public.development_activities
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Students can view activities" ON public.development_activities
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = development_activities.course_id AND e.user_id = auth.uid()
    )
  );

-- Políticas para activity_submissions
CREATE POLICY "Students can manage their own submissions" ON public.activity_submissions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view all submissions" ON public.activity_submissions
  FOR SELECT USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can grade submissions" ON public.activity_submissions
  FOR UPDATE USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Políticas para teacher_student_contacts
CREATE POLICY "Teachers can manage contacts" ON public.teacher_student_contacts
  FOR ALL USING (auth.uid() = teacher_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their contacts" ON public.teacher_student_contacts
  FOR SELECT USING (auth.uid() = student_id);
