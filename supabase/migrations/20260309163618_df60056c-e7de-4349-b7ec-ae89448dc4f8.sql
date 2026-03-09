
-- Add is_elective flag to modules
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS is_elective boolean DEFAULT false;

-- Create student elective selections table
CREATE TABLE IF NOT EXISTS public.student_elective_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  formative_unit_id uuid NOT NULL REFERENCES public.formative_units(id) ON DELETE CASCADE,
  selected_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.student_elective_selections ENABLE ROW LEVEL SECURITY;

-- Users can see their own selections
CREATE POLICY "Users can view own selections" ON public.student_elective_selections
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own selections
CREATE POLICY "Users can insert own selections" ON public.student_elective_selections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own selections
CREATE POLICY "Users can update own selections" ON public.student_elective_selections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Admins and teachers can view all selections
CREATE POLICY "Admins can view all selections" ON public.student_elective_selections
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'teacher')
  );
