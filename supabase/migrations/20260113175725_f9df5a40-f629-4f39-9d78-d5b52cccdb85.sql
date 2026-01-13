-- Tabla para almacenar el temario/slides editables de cada unidad formativa
CREATE TABLE IF NOT EXISTS public.unit_syllabus_slides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    formative_unit_id UUID NOT NULL REFERENCES public.formative_units(id) ON DELETE CASCADE,
    slide_type TEXT NOT NULL DEFAULT 'content', -- 'intro', 'content', 'quiz', 'summary', 'exercise', 'table', 'checklist'
    title TEXT NOT NULL,
    section_title TEXT, -- Nombre de la sección para el índice
    content TEXT, -- Contenido en Markdown
    key_terms TEXT[], -- Términos clave
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    -- Para slides tipo tabla
    table_data JSONB, -- { headers: [], rows: [[]] }
    -- Para slides tipo quiz
    quiz_data JSONB, -- { question, options: [{ id, text, isCorrect }], explanation, hint }
    -- Para slides tipo checklist
    checklist_items JSONB, -- [{ id, text }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_unit_syllabus_slides_unit ON public.unit_syllabus_slides(formative_unit_id);
CREATE INDEX idx_unit_syllabus_slides_order ON public.unit_syllabus_slides(formative_unit_id, order_index);

-- RLS
ALTER TABLE public.unit_syllabus_slides ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver slides activos
CREATE POLICY "Anyone can view active syllabus slides"
ON public.unit_syllabus_slides
FOR SELECT
USING (is_active = true);

-- Política: Admins y teachers pueden gestionar slides
CREATE POLICY "Admins can manage syllabus slides"
ON public.unit_syllabus_slides
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin', 'teacher')
    )
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_unit_syllabus_slides_updated_at
BEFORE UPDATE ON public.unit_syllabus_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();