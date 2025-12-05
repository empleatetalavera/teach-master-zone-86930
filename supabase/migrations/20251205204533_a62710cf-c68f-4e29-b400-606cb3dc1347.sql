-- Add formative_unit_id to evaluations table
ALTER TABLE public.evaluations
ADD COLUMN formative_unit_id uuid REFERENCES public.formative_units(id) ON DELETE SET NULL;

-- Add formative_unit_id to development_activities table
ALTER TABLE public.development_activities
ADD COLUMN formative_unit_id uuid REFERENCES public.formative_units(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_evaluations_formative_unit_id ON public.evaluations(formative_unit_id);
CREATE INDEX idx_development_activities_formative_unit_id ON public.development_activities(formative_unit_id);