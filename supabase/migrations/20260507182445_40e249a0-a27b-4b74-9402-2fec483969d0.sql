DROP INDEX IF EXISTS public.scorm_progress_user_enr_pkg_mod_idx;
CREATE UNIQUE INDEX scorm_progress_user_enr_pkg_mod_idx
ON public.scorm_progress (user_id, enrollment_id, scorm_package_id, module_id);