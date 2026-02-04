-- Create storage bucket for module content
INSERT INTO storage.buckets (id, name, public)
VALUES ('module-content', 'module-content', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for module-content bucket
CREATE POLICY "Module content is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'module-content');

CREATE POLICY "Admins can upload module content"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'module-content');

CREATE POLICY "Admins can update module content"
ON storage.objects FOR UPDATE
USING (bucket_id = 'module-content');

CREATE POLICY "Admins can delete module content"
ON storage.objects FOR DELETE
USING (bucket_id = 'module-content');