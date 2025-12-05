-- Create storage bucket for course content if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-content', 'course-content', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for course content
CREATE POLICY "Anyone can view course content" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-content');

CREATE POLICY "Teachers and admins can upload course content" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'course-content' AND 
  (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  )
);

CREATE POLICY "Teachers and admins can update course content" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'course-content' AND 
  (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  )
);

CREATE POLICY "Teachers and admins can delete course content" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'course-content' AND 
  (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  )
);