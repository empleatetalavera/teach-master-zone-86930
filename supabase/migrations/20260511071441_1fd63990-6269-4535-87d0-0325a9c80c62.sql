-- 1) get_student_time_per_course
CREATE OR REPLACE FUNCTION public.get_student_time_per_course(p_user_id uuid)
RETURNS TABLE(course_id uuid, total_seconds bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    auth.uid() = p_user_id
    OR has_role(auth.uid(), 'super_admin')
    OR (
      (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'))
      AND get_user_center_id(auth.uid()) = get_user_center_id(p_user_id)
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT us.course_id, COALESCE(SUM(us.duration_seconds), 0)::bigint AS total_seconds
  FROM public.user_sessions us
  WHERE us.user_id = p_user_id
    AND us.course_id IS NOT NULL
  GROUP BY us.course_id;
END;
$$;

-- 2) get_student_submissions_status
CREATE OR REPLACE FUNCTION public.get_student_submissions_status(p_user_id uuid)
RETURNS TABLE(course_id uuid, total bigint, submitted bigint, graded bigint, pending bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    auth.uid() = p_user_id
    OR has_role(auth.uid(), 'super_admin')
    OR (
      (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'teacher'))
      AND get_user_center_id(auth.uid()) = get_user_center_id(p_user_id)
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    da.course_id,
    COUNT(*)::bigint AS total,
    COUNT(*) FILTER (WHERE asu.status = 'submitted')::bigint AS submitted,
    COUNT(*) FILTER (WHERE asu.status = 'graded')::bigint AS graded,
    COUNT(*) FILTER (WHERE asu.status = 'submitted')::bigint AS pending
  FROM public.activity_submissions asu
  JOIN public.development_activities da ON da.id = asu.activity_id
  WHERE asu.user_id = p_user_id
  GROUP BY da.course_id;
END;
$$;

-- 3) get_teacher_course_stats
CREATE OR REPLACE FUNCTION public.get_teacher_course_stats(p_user_id uuid)
RETURNS TABLE(
  course_id uuid,
  course_title text,
  students_count bigint,
  avg_progress numeric,
  pending_submissions bigint,
  avg_grade numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    (auth.uid() = p_user_id AND has_role(auth.uid(), 'teacher'))
    OR has_role(auth.uid(), 'super_admin')
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id AS course_id,
    c.title AS course_title,
    (SELECT COUNT(DISTINCT e.user_id) FROM public.enrollments e WHERE e.course_id = c.id)::bigint,
    COALESCE((
      SELECT AVG(up.overall_progress)
      FROM public.unit_progress up
      JOIN public.enrollments e ON e.id = up.enrollment_id
      WHERE e.course_id = c.id
    ), 0)::numeric,
    COALESCE((
      SELECT COUNT(*)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = c.id AND asu.status = 'submitted'
    ), 0)::bigint,
    COALESCE((
      SELECT AVG(asu.score)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = c.id AND asu.status = 'graded' AND asu.score IS NOT NULL
    ), 0)::numeric
  FROM public.courses c
  WHERE c.tutor_id = p_user_id;
END;
$$;

-- 4) get_course_students_overview
CREATE OR REPLACE FUNCTION public.get_course_students_overview(p_course_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  email text,
  avg_progress numeric,
  total_seconds bigint,
  pending_submissions bigint,
  graded_submissions bigint,
  avg_grade numeric,
  last_accessed_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_center uuid;
  v_course_tutor uuid;
BEGIN
  SELECT c.training_center_id, c.tutor_id INTO v_course_center, v_course_tutor
  FROM public.courses c WHERE c.id = p_course_id;

  IF NOT (
    has_role(auth.uid(), 'super_admin')
    OR v_course_tutor = auth.uid()
    OR (has_role(auth.uid(), 'admin') AND v_course_center = get_user_center_id(auth.uid()))
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    e.user_id,
    p.full_name,
    p.email,
    COALESCE((
      SELECT AVG(up.overall_progress)
      FROM public.unit_progress up
      WHERE up.enrollment_id = e.id
    ), 0)::numeric AS avg_progress,
    COALESCE((
      SELECT SUM(us.duration_seconds)
      FROM public.user_sessions us
      WHERE us.user_id = e.user_id AND us.course_id = p_course_id
    ), 0)::bigint AS total_seconds,
    COALESCE((
      SELECT COUNT(*)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = p_course_id AND asu.user_id = e.user_id AND asu.status = 'submitted'
    ), 0)::bigint AS pending_submissions,
    COALESCE((
      SELECT COUNT(*)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = p_course_id AND asu.user_id = e.user_id AND asu.status = 'graded'
    ), 0)::bigint AS graded_submissions,
    COALESCE((
      SELECT AVG(asu.score)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = p_course_id AND asu.user_id = e.user_id AND asu.status = 'graded' AND asu.score IS NOT NULL
    ), 0)::numeric AS avg_grade,
    e.last_accessed_at
  FROM public.enrollments e
  JOIN public.profiles p ON p.id = e.user_id
  WHERE e.course_id = p_course_id;
END;
$$;

-- 5) get_center_overview
CREATE OR REPLACE FUNCTION public.get_center_overview()
RETURNS TABLE(
  training_center_id uuid,
  center_name text,
  total_students bigint,
  total_courses bigint,
  total_enrollments bigint,
  avg_progress numeric,
  pending_submissions bigint,
  avg_grade numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_super boolean := has_role(auth.uid(), 'super_admin');
  v_is_admin boolean := has_role(auth.uid(), 'admin');
  v_center uuid := get_user_center_id(auth.uid());
BEGIN
  IF NOT (v_is_super OR v_is_admin) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    tc.id,
    tc.name,
    (SELECT COUNT(DISTINCT pr.id) FROM public.profiles pr
       JOIN public.user_roles ur ON ur.user_id = pr.id
       WHERE pr.training_center_id = tc.id AND ur.role = 'student')::bigint,
    (SELECT COUNT(*) FROM public.courses c WHERE c.training_center_id = tc.id)::bigint,
    (SELECT COUNT(*) FROM public.enrollments e
       JOIN public.courses c ON c.id = e.course_id
       WHERE c.training_center_id = tc.id)::bigint,
    COALESCE((
      SELECT AVG(up.overall_progress)
      FROM public.unit_progress up
      JOIN public.enrollments e ON e.id = up.enrollment_id
      JOIN public.courses c ON c.id = e.course_id
      WHERE c.training_center_id = tc.id
    ), 0)::numeric,
    COALESCE((
      SELECT COUNT(*)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      JOIN public.courses c ON c.id = da.course_id
      WHERE c.training_center_id = tc.id AND asu.status = 'submitted'
    ), 0)::bigint,
    COALESCE((
      SELECT AVG(asu.score)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      JOIN public.courses c ON c.id = da.course_id
      WHERE c.training_center_id = tc.id AND asu.status = 'graded' AND asu.score IS NOT NULL
    ), 0)::numeric
  FROM public.training_centers tc
  WHERE v_is_super OR tc.id = v_center;
END;
$$;

-- 6) get_course_admin_breakdown
CREATE OR REPLACE FUNCTION public.get_course_admin_breakdown(p_course_id uuid)
RETURNS TABLE(
  course_id uuid,
  course_title text,
  students_count bigint,
  avg_progress numeric,
  avg_grade numeric,
  pending_submissions bigint,
  graded_submissions bigint,
  total_time_seconds bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_center uuid;
BEGIN
  SELECT c.training_center_id INTO v_course_center
  FROM public.courses c WHERE c.id = p_course_id;

  IF NOT (
    has_role(auth.uid(), 'super_admin')
    OR (has_role(auth.uid(), 'admin') AND v_course_center = get_user_center_id(auth.uid()))
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.title,
    (SELECT COUNT(DISTINCT e.user_id) FROM public.enrollments e WHERE e.course_id = c.id)::bigint,
    COALESCE((
      SELECT AVG(up.overall_progress)
      FROM public.unit_progress up
      JOIN public.enrollments e ON e.id = up.enrollment_id
      WHERE e.course_id = c.id
    ), 0)::numeric,
    COALESCE((
      SELECT AVG(asu.score)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = c.id AND asu.status = 'graded' AND asu.score IS NOT NULL
    ), 0)::numeric,
    COALESCE((
      SELECT COUNT(*)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = c.id AND asu.status = 'submitted'
    ), 0)::bigint,
    COALESCE((
      SELECT COUNT(*)
      FROM public.activity_submissions asu
      JOIN public.development_activities da ON da.id = asu.activity_id
      WHERE da.course_id = c.id AND asu.status = 'graded'
    ), 0)::bigint,
    COALESCE((
      SELECT SUM(us.duration_seconds)
      FROM public.user_sessions us
      WHERE us.course_id = c.id
    ), 0)::bigint
  FROM public.courses c
  WHERE c.id = p_course_id;
END;
$$;