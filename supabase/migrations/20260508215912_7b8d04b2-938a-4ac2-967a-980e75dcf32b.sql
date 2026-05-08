-- Add tutor-only flag to forum topics for SEPE compliance
ALTER TABLE public.forum_topics
  ADD COLUMN IF NOT EXISTS is_tutor_only boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_forum_topics_tutor_only
  ON public.forum_topics (course_id, is_tutor_only);

-- Drop any existing SELECT policy that ignored is_tutor_only and recreate a stricter one
DROP POLICY IF EXISTS "Students cannot see tutor-only topics" ON public.forum_topics;

CREATE POLICY "Students cannot see tutor-only topics"
ON public.forum_topics
FOR SELECT
TO authenticated
USING (
  is_tutor_only = false
  OR public.has_role(auth.uid(), 'teacher'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'auditor'::app_role)
);

-- Same protection for replies: hide replies whose parent topic is tutor-only from students
DROP POLICY IF EXISTS "Students cannot see tutor-only replies" ON public.forum_replies;

CREATE POLICY "Students cannot see tutor-only replies"
ON public.forum_replies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.forum_topics t
    WHERE t.id = forum_replies.topic_id
      AND (
        t.is_tutor_only = false
        OR public.has_role(auth.uid(), 'teacher'::app_role)
        OR public.has_role(auth.uid(), 'admin'::app_role)
        OR public.has_role(auth.uid(), 'super_admin'::app_role)
        OR public.has_role(auth.uid(), 'auditor'::app_role)
      )
  )
);