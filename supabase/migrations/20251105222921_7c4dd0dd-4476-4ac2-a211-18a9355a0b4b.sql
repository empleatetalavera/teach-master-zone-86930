-- Create function to send notification when grade is published
CREATE OR REPLACE FUNCTION public.notify_grade_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id uuid;
  v_course_id uuid;
  v_title text;
  v_score numeric;
  v_item_type text;
  v_item_title text;
BEGIN
  -- Determine the type of grading and get details
  IF TG_TABLE_NAME = 'evaluation_attempts' THEN
    -- Get evaluation details
    SELECT e.title, e.course_id INTO v_item_title, v_course_id
    FROM evaluations e
    WHERE e.id = NEW.evaluation_id;
    
    v_student_id := NEW.user_id;
    v_score := NEW.score;
    v_item_type := 'evaluación';
    
  ELSIF TG_TABLE_NAME = 'activity_submissions' THEN
    -- Get activity details
    SELECT a.title, a.course_id INTO v_item_title, v_course_id
    FROM development_activities a
    WHERE a.id = NEW.activity_id;
    
    v_student_id := NEW.user_id;
    v_score := NEW.score;
    v_item_type := 'actividad';
  END IF;

  -- Only send notification if status is 'graded' or 'completed'
  IF (TG_TABLE_NAME = 'activity_submissions' AND NEW.status = 'graded') OR
     (TG_TABLE_NAME = 'evaluation_attempts' AND NEW.status = 'completed') THEN
    
    -- Create notification
    INSERT INTO notifications (
      user_id,
      type,
      priority,
      title,
      message,
      related_course_id,
      metadata
    ) VALUES (
      v_student_id,
      'grade_published',
      CASE 
        WHEN v_score >= 90 THEN 'high'
        WHEN v_score >= 50 THEN 'normal'
        ELSE 'high'
      END,
      '¡Nueva Calificación!',
      format('Has recibido una calificación de %s%% en la %s "%s"', 
        ROUND(v_score, 2), 
        v_item_type, 
        v_item_title
      ),
      v_course_id,
      jsonb_build_object(
        'grade_type', v_item_type,
        'grade_score', v_score,
        'item_title', v_item_title,
        'graded_at', NEW.updated_at
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for evaluation attempts
DROP TRIGGER IF EXISTS on_evaluation_graded ON evaluation_attempts;
CREATE TRIGGER on_evaluation_graded
  AFTER UPDATE ON evaluation_attempts
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
  EXECUTE FUNCTION notify_grade_published();

-- Create trigger for activity submissions
DROP TRIGGER IF EXISTS on_activity_graded ON activity_submissions;
CREATE TRIGGER on_activity_graded
  AFTER UPDATE ON activity_submissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'graded')
  EXECUTE FUNCTION notify_grade_published();

-- Add index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read) 
WHERE is_read = false;