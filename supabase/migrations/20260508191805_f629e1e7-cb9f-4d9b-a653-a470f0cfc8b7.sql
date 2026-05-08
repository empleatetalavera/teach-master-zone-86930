-- 1. FUNCIÓN HELPER
CREATE OR REPLACE FUNCTION public.get_user_training_center()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT training_center_id FROM public.profiles WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.get_user_training_center() TO authenticated;

-- 2. PROFILES
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot browse other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view authenticated profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: visibility with center isolation" ON public.profiles;

CREATE POLICY "Profiles: visibility with center isolation"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'auditor'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND training_center_id IS NOT NULL
    AND training_center_id = public.get_user_training_center()
  )
);

-- 3. ENROLLMENTS
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Teachers and admins can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Auditors can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can create enrollments for any user" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can delete enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments: visibility with center isolation" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments: insert with center isolation" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments: update with center isolation" ON public.enrollments;
DROP POLICY IF EXISTS "Enrollments: delete with center isolation" ON public.enrollments;

CREATE POLICY "Enrollments: visibility with center isolation"
ON public.enrollments FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'auditor'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);

CREATE POLICY "Enrollments: insert with center isolation"
ON public.enrollments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
    AND course_id IN (SELECT course_id FROM public.course_center_assignments WHERE training_center_id = public.get_user_training_center() AND is_active = true)
  )
);

CREATE POLICY "Enrollments: update with center isolation"
ON public.enrollments FOR UPDATE
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);

CREATE POLICY "Enrollments: delete with center isolation"
ON public.enrollments FOR DELETE
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);

-- 4. MODULE_PROGRESS (uses enrollment_id, not user_id)
DROP POLICY IF EXISTS "Users can view their own progress" ON public.module_progress;
DROP POLICY IF EXISTS "Teachers and admins can view all progress" ON public.module_progress;
DROP POLICY IF EXISTS "Auditors can view all progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.module_progress;
DROP POLICY IF EXISTS "Module progress: visibility with center isolation" ON public.module_progress;
DROP POLICY IF EXISTS "Module progress: insert by self" ON public.module_progress;
DROP POLICY IF EXISTS "Module progress: update by self or admin same center" ON public.module_progress;

CREATE POLICY "Module progress: visibility with center isolation"
ON public.module_progress FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'auditor'::app_role)
  OR enrollment_id IN (SELECT id FROM public.enrollments WHERE user_id = auth.uid())
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      JOIN public.profiles p ON p.id = e.user_id
      WHERE p.training_center_id = public.get_user_training_center()
    )
  )
);

CREATE POLICY "Module progress: insert by self"
ON public.module_progress FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR enrollment_id IN (SELECT id FROM public.enrollments WHERE user_id = auth.uid())
);

CREATE POLICY "Module progress: update by self or admin same center"
ON public.module_progress FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR enrollment_id IN (SELECT id FROM public.enrollments WHERE user_id = auth.uid())
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND enrollment_id IN (
      SELECT e.id FROM public.enrollments e
      JOIN public.profiles p ON p.id = e.user_id
      WHERE p.training_center_id = public.get_user_training_center()
    )
  )
);

-- 5. EVALUATION_ATTEMPTS
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.evaluation_attempts;
DROP POLICY IF EXISTS "Teachers and admins can view all attempts" ON public.evaluation_attempts;
DROP POLICY IF EXISTS "Users can create their own attempts" ON public.evaluation_attempts;
DROP POLICY IF EXISTS "Users can update their own attempts" ON public.evaluation_attempts;
DROP POLICY IF EXISTS "Auditors can view all attempts" ON public.evaluation_attempts;
DROP POLICY IF EXISTS "Evaluation attempts: visibility with center isolation" ON public.evaluation_attempts;
DROP POLICY IF EXISTS "Evaluation attempts: insert by self" ON public.evaluation_attempts;
DROP POLICY IF EXISTS "Evaluation attempts: update with center isolation" ON public.evaluation_attempts;

CREATE POLICY "Evaluation attempts: visibility with center isolation"
ON public.evaluation_attempts FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'auditor'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);

CREATE POLICY "Evaluation attempts: insert by self"
ON public.evaluation_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Evaluation attempts: update with center isolation"
ON public.evaluation_attempts FOR UPDATE
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);

-- 6. ACTIVITY_SUBMISSIONS
DROP POLICY IF EXISTS "Students can view their own submissions" ON public.activity_submissions;
DROP POLICY IF EXISTS "Students can submit activities" ON public.activity_submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON public.activity_submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON public.activity_submissions;
DROP POLICY IF EXISTS "Teachers can grade submissions" ON public.activity_submissions;
DROP POLICY IF EXISTS "Auditors can view submissions" ON public.activity_submissions;
DROP POLICY IF EXISTS "Activity submissions: visibility with center isolation" ON public.activity_submissions;
DROP POLICY IF EXISTS "Activity submissions: insert by self" ON public.activity_submissions;
DROP POLICY IF EXISTS "Activity submissions: update with center isolation" ON public.activity_submissions;

CREATE POLICY "Activity submissions: visibility with center isolation"
ON public.activity_submissions FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'auditor'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);

CREATE POLICY "Activity submissions: insert by self"
ON public.activity_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Activity submissions: update with center isolation"
ON public.activity_submissions FOR UPDATE
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
    AND user_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);

-- 7. TEACHER_STUDENT_CONTACTS
DROP POLICY IF EXISTS "Teachers can manage contacts" ON public.teacher_student_contacts;
DROP POLICY IF EXISTS "Students can view their contacts" ON public.teacher_student_contacts;
DROP POLICY IF EXISTS "Teacher contacts: visibility with center isolation" ON public.teacher_student_contacts;
DROP POLICY IF EXISTS "Teacher contacts: manage with center isolation" ON public.teacher_student_contacts;

CREATE POLICY "Teacher contacts: visibility with center isolation"
ON public.teacher_student_contacts FOR SELECT
USING (
  auth.uid() = teacher_id
  OR auth.uid() = student_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'auditor'::app_role)
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND (
      teacher_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
      OR student_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
    )
  )
);

CREATE POLICY "Teacher contacts: manage with center isolation"
ON public.teacher_student_contacts FOR ALL
USING (
  auth.uid() = teacher_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND teacher_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
)
WITH CHECK (
  auth.uid() = teacher_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    has_role(auth.uid(), 'admin'::app_role)
    AND teacher_id IN (SELECT id FROM public.profiles WHERE training_center_id = public.get_user_training_center())
  )
);