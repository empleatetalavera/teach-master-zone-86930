
-- Table to store SEPE-issued certificates uploaded by admins for students
CREATE TABLE public.sepe_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('theory', 'practice')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, course_id, certificate_type)
);

ALTER TABLE public.sepe_certificates ENABLE ROW LEVEL SECURITY;

-- Students can view their own certificates
CREATE POLICY "Students can view own SEPE certificates"
  ON public.sepe_certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all SEPE certificates
CREATE POLICY "Admins can view all SEPE certificates"
  ON public.sepe_certificates FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Admins can insert SEPE certificates
CREATE POLICY "Admins can insert SEPE certificates"
  ON public.sepe_certificates FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Admins can update SEPE certificates
CREATE POLICY "Admins can update SEPE certificates"
  ON public.sepe_certificates FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Admins can delete SEPE certificates
CREATE POLICY "Admins can delete SEPE certificates"
  ON public.sepe_certificates FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Storage bucket for SEPE certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('sepe-certificates', 'sepe-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Students can download their own certificates
CREATE POLICY "Students can download own SEPE certificates"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sepe-certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can manage all SEPE certificates in storage
CREATE POLICY "Admins can upload SEPE certificates"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sepe-certificates' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Admins can view SEPE certificates storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sepe-certificates' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Admins can delete SEPE certificates storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sepe-certificates' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));
