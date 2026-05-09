ALTER TABLE public.module_content DROP CONSTRAINT IF EXISTS module_content_content_type_check;
ALTER TABLE public.module_content ADD CONSTRAINT module_content_content_type_check
  CHECK (content_type = ANY (ARRAY[
    'manual_pdf','video','external_link','document','presentation',
    'intro_video','objectives_pdf','concept_map',
    'support_doc','support_video','support_audio','biblioteca'
  ]));