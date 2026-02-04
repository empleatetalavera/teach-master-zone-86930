
-- Create table for module content (PDFs, manuals, downloadable files)
CREATE TABLE public.module_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('manual_pdf', 'video', 'external_link', 'document', 'presentation')),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  external_url TEXT,
  embed_url TEXT, -- For Calameo, Issuu, or other embedded viewers
  order_index INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Module content is viewable by enrolled students"
ON public.module_content FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN modules m ON m.course_id = e.course_id
    WHERE m.id = module_content.module_id
    AND e.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin', 'teacher', 'auditor')
  )
);

CREATE POLICY "Admins and teachers can manage module content"
ON public.module_content FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'super_admin', 'teacher')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_module_content_updated_at
BEFORE UPDATE ON public.module_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_module_content_module_id ON public.module_content(module_id);
