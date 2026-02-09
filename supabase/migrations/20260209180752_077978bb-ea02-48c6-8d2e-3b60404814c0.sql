-- Table to store issued certificates with verification codes
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id),
  verification_code TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  student_dni TEXT,
  course_title TEXT NOT NULL,
  course_hours INTEGER,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pdf_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate certificates
CREATE UNIQUE INDEX idx_certificates_user_course ON public.certificates(user_id, course_id);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
ON public.certificates FOR SELECT
USING (auth.uid() = user_id);

-- Teachers and admins can view certificates for their courses
CREATE POLICY "Teachers can view course certificates"
ON public.certificates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'teacher', 'super_admin')
  )
);

-- System can insert certificates (via authenticated users)
CREATE POLICY "Users can generate their own certificate"
ON public.certificates FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Public read for verification (only specific fields via RPC)
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE (
  student_name TEXT,
  course_title TEXT,
  course_hours INTEGER,
  issue_date TIMESTAMP WITH TIME ZONE,
  verification_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.student_name,
    c.course_title,
    c.course_hours,
    c.issue_date,
    c.verification_code
  FROM public.certificates c
  WHERE c.verification_code = p_code
  LIMIT 1;
END;
$$;