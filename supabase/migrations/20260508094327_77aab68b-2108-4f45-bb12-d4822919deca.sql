-- Trigger to enforce that course_center_assignments only references catalog courses (training_center_id IS NULL)
CREATE OR REPLACE FUNCTION public.enforce_catalog_only_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_center uuid;
BEGIN
  SELECT training_center_id INTO v_course_center
  FROM public.courses
  WHERE id = NEW.course_id;

  IF v_course_center IS NOT NULL THEN
    RAISE EXCEPTION 'course_center_assignments only allows catalog courses (training_center_id IS NULL). Course % belongs to center %', NEW.course_id, v_course_center
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_catalog_only_assignment ON public.course_center_assignments;
CREATE TRIGGER trg_enforce_catalog_only_assignment
BEFORE INSERT OR UPDATE ON public.course_center_assignments
FOR EACH ROW
EXECUTE FUNCTION public.enforce_catalog_only_assignment();