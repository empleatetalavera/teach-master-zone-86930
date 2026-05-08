ALTER TABLE public.unit_progress REPLICA IDENTITY FULL;
ALTER TABLE public.scorm_progress REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.unit_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scorm_progress;