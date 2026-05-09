-- 1. forum_topics: soporte por UF y categoría
ALTER TABLE public.forum_topics
  ADD COLUMN IF NOT EXISTS formative_unit_id uuid REFERENCES public.formative_units(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS idx_forum_topics_uf ON public.forum_topics(formative_unit_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON public.forum_topics(category);

-- 2. evaluations: distinguir tipo
ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS evaluation_type text NOT NULL DEFAULT 'unit';

CREATE INDEX IF NOT EXISTS idx_evaluations_type ON public.evaluations(evaluation_type);

-- 3. module_content: índice por content_type para acelerar la nueva agrupación por tipo
CREATE INDEX IF NOT EXISTS idx_module_content_type ON public.module_content(content_type);
CREATE INDEX IF NOT EXISTS idx_module_content_uf_type ON public.module_content(formative_unit_id, content_type);