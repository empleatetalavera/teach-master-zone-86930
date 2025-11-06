-- Create table for audit logging of generated reports
CREATE TABLE IF NOT EXISTS public.report_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type character varying NOT NULL,
  report_name text NOT NULL,
  filters_applied jsonb DEFAULT '{}'::jsonb,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_format character varying NOT NULL DEFAULT 'pdf',
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.report_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins and auditors can view all report logs
CREATE POLICY "Admins and auditors can view all reports"
ON public.report_audit_log
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'auditor'::app_role) OR
  has_role(auth.uid(), 'teacher'::app_role)
);

-- Users can insert their own report logs
CREATE POLICY "Users can log their own reports"
ON public.report_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = generated_by);

-- Create index for better performance
CREATE INDEX idx_report_audit_log_generated_by ON public.report_audit_log(generated_by);
CREATE INDEX idx_report_audit_log_generated_at ON public.report_audit_log(generated_at DESC);
CREATE INDEX idx_report_audit_log_course_id ON public.report_audit_log(course_id);

COMMENT ON TABLE public.report_audit_log IS 'Audit log for all generated and downloaded reports in the system';