-- Create storage bucket for course annexes
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-annexes', 'course-annexes', true)
ON CONFLICT (id) DO NOTHING;

-- Create table to track course annexes
CREATE TABLE IF NOT EXISTS public.course_annexes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  annex_type TEXT NOT NULL CHECK (annex_type IN ('anexo_iii', 'anexo_iv', 'anexo_v')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, annex_type)
);

-- Enable RLS
ALTER TABLE public.course_annexes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view annexes (public documents)
CREATE POLICY "Anyone can view course annexes"
ON public.course_annexes
FOR SELECT
USING (true);

-- Policy: Authenticated users with admin/teacher role can manage annexes
CREATE POLICY "Admins and teachers can manage annexes"
ON public.course_annexes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin', 'teacher')
  )
);

-- Storage policies for course-annexes bucket
CREATE POLICY "Anyone can view course annexes storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-annexes');

CREATE POLICY "Admins can upload course annexes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-annexes' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin', 'teacher')
  )
);

CREATE POLICY "Admins can update course annexes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-annexes' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin', 'teacher')
  )
);

CREATE POLICY "Admins can delete course annexes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-annexes' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('super_admin', 'admin', 'teacher')
  )
);