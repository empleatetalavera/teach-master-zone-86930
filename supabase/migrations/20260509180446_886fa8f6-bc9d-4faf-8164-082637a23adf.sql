CREATE OR REPLACE FUNCTION public.current_training_center_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.training_center_id
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1
$$;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('module-content', 'module-content', false, 262144000)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 262144000;

DROP POLICY IF EXISTS "Module content is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload module content" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update module content" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete module content" ON storage.objects;
DROP POLICY IF EXISTS "Center members can read module content storage" ON storage.objects;
DROP POLICY IF EXISTS "Center admins can upload module content storage" ON storage.objects;
DROP POLICY IF EXISTS "Center admins can update module content storage" ON storage.objects;
DROP POLICY IF EXISTS "Center admins can delete module content storage" ON storage.objects;

CREATE POLICY "Center members can read module content storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'module-content'
  AND (
    (storage.foldername(name))[1]::uuid = public.current_training_center_id()
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  )
);

CREATE POLICY "Center admins can upload module content storage"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'module-content'
  AND (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'admin'::app_role)
      AND (storage.foldername(name))[1]::uuid = public.current_training_center_id()
    )
  )
);

CREATE POLICY "Center admins can update module content storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'module-content'
  AND (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'admin'::app_role)
      AND (storage.foldername(name))[1]::uuid = public.current_training_center_id()
    )
  )
)
WITH CHECK (
  bucket_id = 'module-content'
  AND (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'admin'::app_role)
      AND (storage.foldername(name))[1]::uuid = public.current_training_center_id()
    )
  )
);

CREATE POLICY "Center admins can delete module content storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'module-content'
  AND (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      public.has_role(auth.uid(), 'admin'::app_role)
      AND (storage.foldername(name))[1]::uuid = public.current_training_center_id()
    )
  )
);