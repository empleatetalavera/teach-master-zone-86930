
-- Migration: 20251105155442
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create training centers table
CREATE TABLE public.training_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT 'hsl(217, 91%, 60%)',
  secondary_color TEXT DEFAULT 'hsl(262, 83%, 58%)',
  official_badge TEXT,
  footer_text TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on training_centers
ALTER TABLE public.training_centers ENABLE ROW LEVEL SECURITY;

-- Create licenses table
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_center_id UUID REFERENCES public.training_centers(id) ON DELETE CASCADE NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('basic', 'professional', 'enterprise', 'custom')),
  max_students INTEGER NOT NULL DEFAULT 50,
  max_teachers INTEGER NOT NULL DEFAULT 5,
  max_courses INTEGER NOT NULL DEFAULT 10,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on licenses
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Create content orders table
CREATE TABLE public.content_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_center_id UUID REFERENCES public.training_centers(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'module', 'video', 'document', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  requested_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on content_orders
ALTER TABLE public.content_orders ENABLE ROW LEVEL SECURITY;

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_training_centers_updated_at
  BEFORE UPDATE ON public.training_centers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_orders_updated_at
  BEFORE UPDATE ON public.content_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for training_centers
CREATE POLICY "Admins can manage training centers"
  ON public.training_centers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Everyone can view active training centers"
  ON public.training_centers FOR SELECT
  USING (is_active = true);

-- RLS Policies for licenses
CREATE POLICY "Admins can manage licenses"
  ON public.licenses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view licenses"
  ON public.licenses FOR SELECT
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for content_orders
CREATE POLICY "Admins can manage all content orders"
  ON public.content_orders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view their orders"
  ON public.content_orders FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher') AND 
    (requested_by = auth.uid() OR assigned_to = auth.uid())
  );

-- Migration: 20251105161754
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Migration: 20251105161936
-- Add visibility setting to profiles
DO $$ BEGIN
  CREATE TYPE profile_visibility AS ENUM ('public', 'private', 'authenticated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS visibility profile_visibility DEFAULT 'authenticated';

-- Update RLS policies to respect visibility settings
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Public profiles can be viewed by everyone
CREATE POLICY "Anyone can view public profiles"
  ON public.profiles
  FOR SELECT
  USING (visibility = 'public');

-- Authenticated profiles can be viewed by logged-in users
CREATE POLICY "Authenticated users can view authenticated profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (visibility = 'authenticated');

-- Users can always view their own profile regardless of visibility
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Private profiles are only visible to the owner (covered by the policy above);

-- Migration: 20251105163653
-- Create courses table
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text,
  level text CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours integer,
  thumbnail_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  training_center_id uuid REFERENCES public.training_centers(id)
);

-- Create modules table
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  order_index integer NOT NULL,
  duration_minutes integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_at timestamp with time zone,
  UNIQUE(user_id, course_id)
);

-- Create module_progress table
CREATE TABLE public.module_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  time_spent_minutes integer DEFAULT 0,
  last_position text,
  notes text,
  UNIQUE(enrollment_id, module_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view active courses"
  ON public.courses
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins and teachers can manage courses"
  ON public.courses
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for modules
CREATE POLICY "Users can view modules of active courses"
  ON public.modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = modules.course_id 
      AND courses.is_active = true
    )
  );

CREATE POLICY "Admins and teachers can manage modules"
  ON public.modules
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'teacher')
  );

-- RLS Policies for enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments"
  ON public.enrollments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can view all enrollments"
  ON public.enrollments
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "Users can update their own enrollments"
  ON public.enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for module_progress
CREATE POLICY "Users can view their own progress"
  ON public.module_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollments.id = module_progress.enrollment_id 
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own progress"
  ON public.module_progress
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollments.id = module_progress.enrollment_id 
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers and admins can view all progress"
  ON public.module_progress
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'teacher')
  );

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251105164017
-- Create AI conversations table to track assistant interactions
CREATE TABLE public.ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_role app_role,
  user_message text NOT NULL,
  assistant_response text NOT NULL,
  context_page text,
  context_course_id uuid REFERENCES public.courses(id),
  context_module_id uuid REFERENCES public.modules(id),
  response_time_ms integer,
  was_helpful boolean,
  feedback_text text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.ai_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_course_id ON public.ai_conversations(context_course_id);
CREATE INDEX idx_ai_conversations_module_id ON public.ai_conversations(context_module_id);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

-- Migration: 20251105164905
-- Add inspector role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'inspector';

-- Migration: 20251105165022
-- Create enum for session types
CREATE TYPE session_type AS ENUM ('login', 'logout', 'course_view', 'module_view', 'evaluation', 'communication');

-- Create enum for communication types
CREATE TYPE communication_type AS ENUM ('message', 'forum', 'chat', 'video_call');

-- Create enum for evaluation status
CREATE TYPE evaluation_status AS ENUM ('not_started', 'in_progress', 'completed', 'passed', 'failed');

-- User sessions tracking (trazabilidad de conexiones)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type session_type NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Content interaction tracking (trazabilidad del contenido)
CREATE TABLE content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'complete', 'pause', 'resume'
  sequence_position INTEGER,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  metadata JSONB, -- para datos adicionales como posición del video, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Communications log (registro de comunicaciones)
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_type communication_type NOT NULL,
  sender_id UUID NOT NULL,
  receiver_id UUID,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES communications(id) ON DELETE CASCADE, -- para hilos
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB, -- para datos como duración de videollamada, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Evaluations (sistema de evaluaciones)
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score NUMERIC NOT NULL DEFAULT 50,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Evaluation attempts (intentos de evaluación)
CREATE TABLE evaluation_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status evaluation_status NOT NULL DEFAULT 'not_started',
  score NUMERIC,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  answers JSONB, -- respuestas del alumno
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inspector users (usuarios de inspección SEPE)
CREATE TABLE inspector_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  inspector_code TEXT NOT NULL UNIQUE,
  organization TEXT NOT NULL, -- 'SEPE', 'Fundae', etc.
  granted_by UUID NOT NULL, -- admin que otorgó el acceso
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  access_log JSONB, -- registro de accesos del inspector
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_course_id ON user_sessions(course_id);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX idx_content_interactions_user_id ON content_interactions(user_id);
CREATE INDEX idx_content_interactions_module_id ON content_interactions(module_id);
CREATE INDEX idx_content_interactions_enrollment_id ON content_interactions(enrollment_id);
CREATE INDEX idx_communications_sender_id ON communications(sender_id);
CREATE INDEX idx_communications_receiver_id ON communications(receiver_id);
CREATE INDEX idx_communications_course_id ON communications(course_id);
CREATE INDEX idx_evaluation_attempts_user_id ON evaluation_attempts(user_id);
CREATE INDEX idx_evaluation_attempts_evaluation_id ON evaluation_attempts(evaluation_id);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspector_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can view all sessions"
  ON user_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Inspectors can view all sessions"
  ON user_sessions FOR SELECT
  USING (has_role(auth.uid(), 'inspector'));

-- RLS Policies for content_interactions
CREATE POLICY "Users can manage their own interactions"
  ON content_interactions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can view all interactions"
  ON content_interactions FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Inspectors can view all interactions"
  ON content_interactions FOR SELECT
  USING (has_role(auth.uid(), 'inspector'));

-- RLS Policies for communications
CREATE POLICY "Users can view their own communications"
  ON communications FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send communications"
  ON communications FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages"
  ON communications FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Admins and teachers can view all communications"
  ON communications FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Inspectors can view all communications"
  ON communications FOR SELECT
  USING (has_role(auth.uid(), 'inspector'));

-- RLS Policies for evaluations
CREATE POLICY "Everyone can view active evaluations"
  ON evaluations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins and teachers can manage evaluations"
  ON evaluations FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Inspectors can view all evaluations"
  ON evaluations FOR SELECT
  USING (has_role(auth.uid(), 'inspector'));

-- RLS Policies for evaluation_attempts
CREATE POLICY "Users can manage their own attempts"
  ON evaluation_attempts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can view all attempts"
  ON evaluation_attempts FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'));

CREATE POLICY "Inspectors can view all attempts"
  ON evaluation_attempts FOR SELECT
  USING (has_role(auth.uid(), 'inspector'));

-- RLS Policies for inspector_users
CREATE POLICY "Admins can manage inspector users"
  ON inspector_users FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Inspectors can view their own record"
  ON inspector_users FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger to update evaluations updated_at
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate session duration
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_user_session_duration
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_duration();

-- Migration: 20251105165108
-- Fix security warning: Add search_path to function
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Migration: 20251105184834
-- Create login_attempts table to track failed login attempts
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempt_time DESC);
CREATE INDEX idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempt_time DESC);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view all login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public inserts (needed for login tracking before authentication)
CREATE POLICY "Anyone can insert login attempts"
ON public.login_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.is_account_locked(p_email TEXT)
RETURNS TABLE(is_locked BOOLEAN, unlock_time TIMESTAMP WITH TIME ZONE) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_attempts INTEGER;
  v_last_attempt TIMESTAMP WITH TIME ZONE;
  v_lockout_minutes INTEGER := 15; -- Lockout for 15 minutes
  v_max_attempts INTEGER := 5; -- Max 5 failed attempts
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*), MAX(attempt_time)
  INTO v_failed_attempts, v_last_attempt
  FROM public.login_attempts
  WHERE email = p_email
    AND success = FALSE
    AND attempt_time > NOW() - INTERVAL '15 minutes';

  -- Check if account should be locked
  IF v_failed_attempts >= v_max_attempts THEN
    RETURN QUERY SELECT 
      TRUE as is_locked,
      (v_last_attempt + INTERVAL '15 minutes') as unlock_time;
  ELSE
    RETURN QUERY SELECT 
      FALSE as is_locked,
      NULL::TIMESTAMP WITH TIME ZONE as unlock_time;
  END IF;
END;
$$;

-- Function to clean old login attempts (optional, for maintenance)
CREATE OR REPLACE FUNCTION public.clean_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempt_time < NOW() - INTERVAL '7 days';
END;
$$;

-- Migration: 20251105191451
-- Extender tabla profiles con datos SEPE
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dni_nie VARCHAR(20),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS province VARCHAR(100),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Crear tabla para datos laborales
CREATE TABLE IF NOT EXISTS public.student_employment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employment_status VARCHAR(50) NOT NULL, -- empleado, desempleado, autonomo
  company_name VARCHAR(255),
  job_position VARCHAR(255),
  education_level VARCHAR(100),
  work_experience_years INTEGER,
  professional_sector VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Crear tabla para documentos del alumno
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- dni, certificado_empresa, vida_laboral, etc
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para historial de formación
CREATE TABLE IF NOT EXISTS public.student_training_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name VARCHAR(255) NOT NULL,
  training_center VARCHAR(255),
  start_date DATE,
  end_date DATE,
  hours INTEGER,
  certificate_number VARCHAR(100),
  is_sepe_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear bucket para documentos de alumnos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS para student_employment_data
ALTER TABLE public.student_employment_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employment data"
ON public.student_employment_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employment data"
ON public.student_employment_data
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employment data"
ON public.student_employment_data
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can view all employment data"
ON public.student_employment_data
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- RLS para student_documents
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
ON public.student_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON public.student_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.student_documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can view all documents"
ON public.student_documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins can update document status"
ON public.student_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS para student_training_history
ALTER TABLE public.student_training_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training history"
ON public.student_training_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own training history"
ON public.student_training_history
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins and teachers can view all training history"
ON public.student_training_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- Storage policies para student-documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'student-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'student-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'student-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all student documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'student-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger para updated_at en student_employment_data
CREATE TRIGGER update_student_employment_data_updated_at
BEFORE UPDATE ON public.student_employment_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at en student_documents
CREATE TRIGGER update_student_documents_updated_at
BEFORE UPDATE ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251105191810
-- Crear tabla para consultas/tickets de atención al alumno
CREATE TABLE IF NOT EXISTS public.student_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- tecnico, academico, administrativo, otro
  priority VARCHAR(50) DEFAULT 'normal', -- baja, normal, alta, urgente
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla para respuestas/mensajes del ticket
CREATE TABLE IF NOT EXISTS public.student_support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.student_support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para student_support_tickets
ALTER TABLE public.student_support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own tickets"
ON public.student_support_tickets
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create tickets"
ON public.student_support_tickets
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own tickets"
ON public.student_support_tickets
FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Admins and teachers can view all tickets"
ON public.student_support_tickets
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins and teachers can update all tickets"
ON public.student_support_tickets
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- RLS para student_support_messages
ALTER TABLE public.student_support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their tickets"
ON public.student_support_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.student_support_tickets
    WHERE id = ticket_id
    AND (student_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
);

CREATE POLICY "Users can create messages in their tickets"
ON public.student_support_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.student_support_tickets
    WHERE id = ticket_id
    AND (student_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_student_support_tickets_updated_at
BEFORE UPDATE ON public.student_support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251105193509
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  related_course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create alert settings table
CREATE TABLE IF NOT EXISTS public.alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  inactive_days_threshold INTEGER DEFAULT 7,
  low_progress_threshold INTEGER DEFAULT 30,
  enable_email_alerts BOOLEAN DEFAULT TRUE,
  enable_push_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

-- Policies for alert settings
CREATE POLICY "Users can view their own alert settings"
ON public.alert_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert settings"
ON public.alert_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert settings"
ON public.alert_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_alert_settings_updated_at
BEFORE UPDATE ON public.alert_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251105193934
-- Create quick response templates table
CREATE TABLE IF NOT EXISTS public.quick_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  template_type VARCHAR(50) NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_response_templates ENABLE ROW LEVEL SECURITY;

-- Policies for quick response templates
CREATE POLICY "Users can view their own templates"
ON public.quick_response_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
ON public.quick_response_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.quick_response_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.quick_response_templates FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_quick_response_templates_user_id ON public.quick_response_templates(user_id);
CREATE INDEX idx_quick_response_templates_type ON public.quick_response_templates(template_type);

-- Trigger to update updated_at
CREATE TRIGGER update_quick_response_templates_updated_at
BEFORE UPDATE ON public.quick_response_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates for new teachers
CREATE OR REPLACE FUNCTION public.create_default_quick_responses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create templates for teachers
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'teacher'
  ) THEN
    -- Inactive student template
    INSERT INTO public.quick_response_templates (user_id, name, subject, message, template_type)
    VALUES (
      NEW.user_id,
      'Mensaje por Inactividad',
      'Nos preocupa tu ausencia en el curso',
      'Hola,

He notado que no has accedido al curso en varios días. Me gustaría saber si hay algo en lo que pueda ayudarte o si tienes alguna dificultad con el contenido.

Recuerda que estoy aquí para apoyarte en tu formación. No dudes en contactarme si necesitas ayuda.

¡Espero verte pronto en la plataforma!',
      'inactive'
    );

    -- Low performance template
    INSERT INTO public.quick_response_templates (user_id, name, subject, message, template_type)
    VALUES (
      NEW.user_id,
      'Apoyo por Bajo Rendimiento',
      'Ofrezcamos apoyo adicional',
      'Hola,

He revisado tu progreso en el curso y me gustaría ofrecerte apoyo adicional para que puedas alcanzar tus objetivos.

¿Te gustaría que agendemos una tutoría individual? Puedo ayudarte a repasar los conceptos que te resulten más difíciles.

Estoy aquí para ayudarte a tener éxito.',
      'low_performance'
    );

    -- General encouragement template
    INSERT INTO public.quick_response_templates (user_id, name, subject, message, template_type)
    VALUES (
      NEW.user_id,
      'Mensaje de Ánimo',
      '¡Sigue adelante con tu formación!',
      'Hola,

Quiero animarte a continuar con tu formación. Has avanzado hasta aquí y eso es algo de lo que estar orgulloso.

Si tienes dudas o necesitas ayuda con algún tema, no dudes en contactarme. Estoy aquí para apoyarte.

¡Tú puedes lograrlo!',
      'encouragement'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to create default templates when user_roles is created
CREATE TRIGGER create_default_quick_responses_trigger
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_quick_responses();

-- Migration: 20251105194532
-- Update the function to create default templates with dynamic variables
CREATE OR REPLACE FUNCTION public.create_default_quick_responses()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create templates for teachers
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'teacher'
  ) THEN
    -- Inactive student template with dynamic variables
    INSERT INTO public.quick_response_templates (user_id, name, subject, message, template_type)
    VALUES (
      NEW.user_id,
      'Mensaje por Inactividad',
      'Nos preocupa tu ausencia en {nombre_curso}',
      'Hola {nombre_estudiante},

He notado que no has accedido al curso "{nombre_curso}" en {dias_inactivo} días (último acceso: {ultimo_acceso}). Me gustaría saber si hay algo en lo que pueda ayudarte o si tienes alguna dificultad con el contenido.

Tu progreso actual es del {progreso}%, y me gustaría ayudarte a alcanzar tus objetivos.

Recuerda que estoy aquí para apoyarte en tu formación. No dudes en contactarme si necesitas ayuda.

¡Espero verte pronto en la plataforma!',
      'inactive'
    );

    -- Low performance template with dynamic variables
    INSERT INTO public.quick_response_templates (user_id, name, subject, message, template_type)
    VALUES (
      NEW.user_id,
      'Apoyo por Bajo Rendimiento',
      'Apoyo adicional para {nombre_curso}',
      'Hola {nombre_estudiante},

He revisado tu progreso en "{nombre_curso}" y veo que llevas un {progreso}% completado. Me gustaría ofrecerte apoyo adicional para que puedas alcanzar tus objetivos de formación.

¿Te gustaría que agendemos una tutoría individual? Puedo ayudarte a repasar los conceptos que te resulten más difíciles y resolver cualquier duda que tengas.

Tu éxito es importante para mí, y estoy aquí para ayudarte a lograrlo.

¿Cuándo te vendría bien conectarnos?',
      'low_performance'
    );

    -- General encouragement template with dynamic variables
    INSERT INTO public.quick_response_templates (user_id, name, subject, message, template_type)
    VALUES (
      NEW.user_id,
      'Mensaje de Ánimo',
      '¡Sigue adelante con {nombre_curso}!',
      'Hola {nombre_estudiante},

Quiero animarte a continuar con tu formación en "{nombre_curso}". Llevas un {progreso}% completado, y eso es algo de lo que estar orgulloso.

Cada paso que das te acerca más a tus metas. Si tienes dudas o necesitas ayuda con algún tema, no dudes en contactarme. Estoy aquí para apoyarte.

¡Tú puedes lograrlo! Sigue así.

Saludos cordiales',
      'encouragement'
    );
  END IF;
  
  RETURN NEW;
END;
$$;
