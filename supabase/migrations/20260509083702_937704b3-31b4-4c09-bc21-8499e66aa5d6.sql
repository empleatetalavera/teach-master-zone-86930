-- SEPE compliance: evaluation criteria, instructions, deadline, submission instructions
ALTER TABLE public.development_activities
  ADD COLUMN IF NOT EXISTS evaluation_criteria text,
  ADD COLUMN IF NOT EXISTS submission_instructions text;

ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS evaluation_criteria text,
  ADD COLUMN IF NOT EXISTS due_date timestamptz;