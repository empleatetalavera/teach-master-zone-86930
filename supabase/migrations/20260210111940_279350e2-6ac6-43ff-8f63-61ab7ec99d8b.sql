-- Add enrollment_role to enrollments table to differentiate tutor vs student per course
ALTER TABLE public.enrollments 
ADD COLUMN enrollment_role text NOT NULL DEFAULT 'student' 
CHECK (enrollment_role IN ('student', 'teacher'));

-- Update existing enrollments: mark enrollments where the user is the course tutor
UPDATE public.enrollments e
SET enrollment_role = 'teacher'
FROM public.courses c
WHERE e.course_id = c.id 
  AND e.user_id = c.tutor_id;

-- Add index for filtering by role
CREATE INDEX idx_enrollments_role ON public.enrollments(enrollment_role);