-- Add columns for uploaded student guide and training program PDFs
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS student_guide_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS training_program_pdf_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.courses.student_guide_pdf_url IS 'URL del PDF de la Guía del Alumno subido por el administrador';
COMMENT ON COLUMN public.courses.training_program_pdf_url IS 'URL del PDF del Programa Formativo subido por el administrador';

-- Create storage bucket for course documents if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-documents', 'course-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for course-documents bucket
CREATE POLICY "Course documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-documents');

CREATE POLICY "Admins and teachers can upload course documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-documents' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'teacher')
  )
);

CREATE POLICY "Admins and teachers can update course documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-documents' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'teacher')
  )
);

CREATE POLICY "Admins and teachers can delete course documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-documents' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'teacher')
  )
);