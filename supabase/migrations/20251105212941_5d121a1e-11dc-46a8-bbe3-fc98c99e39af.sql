-- ============================================
-- SCORM Content Management System
-- ============================================

-- Create storage bucket for SCORM packages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scorm-packages',
  'scorm-packages',
  false,
  524288000, -- 500MB limit per file
  ARRAY['application/zip', 'application/x-zip-compressed']
)
ON CONFLICT (id) DO NOTHING;

-- Create table for SCORM packages
CREATE TABLE IF NOT EXISTS public.scorm_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  scorm_version VARCHAR(20), -- '1.2' or '2004'
  uploaded_by UUID REFERENCES auth.users(id),
  manifest_data JSONB, -- Store parsed imsmanifest.xml data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create table to link SCORM packages to modules
CREATE TABLE IF NOT EXISTS public.module_scorm_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  scorm_package_id UUID NOT NULL REFERENCES public.scorm_packages(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(module_id, scorm_package_id)
);

-- Create table for SCORM progress tracking (CMI data)
CREATE TABLE IF NOT EXISTS public.scorm_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  scorm_package_id UUID NOT NULL REFERENCES public.scorm_packages(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  cmi_data JSONB DEFAULT '{}'::jsonb, -- Store all CMI variables
  lesson_status VARCHAR(50), -- 'not attempted', 'incomplete', 'completed', 'passed', 'failed'
  score_raw NUMERIC(5,2),
  score_min NUMERIC(5,2),
  score_max NUMERIC(5,2),
  session_time VARCHAR(50),
  total_time VARCHAR(50),
  completion_status VARCHAR(50),
  success_status VARCHAR(50),
  suspend_data TEXT,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, scorm_package_id, enrollment_id)
);

-- Enable RLS on all tables
ALTER TABLE public.scorm_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_scorm_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorm_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scorm_packages
CREATE POLICY "Teachers and admins can manage SCORM packages"
ON public.scorm_packages FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

CREATE POLICY "Students can view active SCORM packages"
ON public.scorm_packages FOR SELECT
USING (is_active = true);

-- RLS Policies for module_scorm_content
CREATE POLICY "Teachers and admins can manage module SCORM content"
ON public.module_scorm_content FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

CREATE POLICY "Students can view module SCORM content"
ON public.module_scorm_content FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON m.course_id = c.id
    WHERE m.id = module_scorm_content.module_id
    AND c.is_active = true
    AND m.is_active = true
  )
);

-- RLS Policies for scorm_progress
CREATE POLICY "Users can manage their own SCORM progress"
ON public.scorm_progress FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Teachers and admins can view all SCORM progress"
ON public.scorm_progress FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'teacher'::app_role)
);

-- Storage policies for SCORM packages bucket
CREATE POLICY "Teachers and admins can upload SCORM packages"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'scorm-packages' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

CREATE POLICY "Teachers and admins can update SCORM packages"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'scorm-packages' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

CREATE POLICY "Teachers and admins can delete SCORM packages"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'scorm-packages' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

CREATE POLICY "Authenticated users can download SCORM packages"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'scorm-packages' AND
  auth.uid() IS NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scorm_packages_uploaded_by ON public.scorm_packages(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_scorm_packages_active ON public.scorm_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_module_scorm_content_module ON public.module_scorm_content(module_id);
CREATE INDEX IF NOT EXISTS idx_module_scorm_content_scorm ON public.module_scorm_content(scorm_package_id);
CREATE INDEX IF NOT EXISTS idx_scorm_progress_user ON public.scorm_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_scorm_progress_enrollment ON public.scorm_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_scorm_progress_package ON public.scorm_progress(scorm_package_id);

-- Create trigger for updated_at
CREATE TRIGGER update_scorm_packages_updated_at
BEFORE UPDATE ON public.scorm_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scorm_progress_updated_at
BEFORE UPDATE ON public.scorm_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();