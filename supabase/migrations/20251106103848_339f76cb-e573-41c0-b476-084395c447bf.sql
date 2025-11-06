-- Grant auditors access to view enrollments and progress
CREATE POLICY "Auditors can view all enrollments"
ON public.enrollments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view courses
CREATE POLICY "Auditors can view all courses"
ON public.courses
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view modules
CREATE POLICY "Auditors can view all modules"
ON public.modules
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view content interactions (time tracking)
CREATE POLICY "Auditors can view all content interactions"
ON public.content_interactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view AI conversations (feedback)
CREATE POLICY "Auditors can view all AI conversations"
ON public.ai_conversations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view activity submissions
CREATE POLICY "Auditors can view all activity submissions"
ON public.activity_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view evaluation attempts
CREATE POLICY "Auditors can view all evaluation attempts"
ON public.evaluation_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view module progress
CREATE POLICY "Auditors can view all module progress"
ON public.module_progress
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view SCORM progress
CREATE POLICY "Auditors can view all SCORM progress"
ON public.scorm_progress
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view communications
CREATE POLICY "Auditors can view all communications"
ON public.communications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));

-- Grant auditors access to view profiles (for student information)
CREATE POLICY "Auditors can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'auditor'::app_role));