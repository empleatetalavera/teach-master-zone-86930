import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export function useSessionTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date>(new Date());

  // Detect session type based on current route
  const getSessionType = (pathname: string) => {
    if (pathname.includes('/course/') && pathname.includes('/module/')) {
      return 'module_view';
    } else if (pathname.includes('/course/')) {
      return 'course_view';
    } else if (pathname.includes('/evaluations')) {
      return 'evaluation';
    } else if (pathname.includes('/messages')) {
      return 'communication';
    }
    return 'course_view';
  };

  // Extract course and module IDs from pathname
  const getRouteIds = (pathname: string) => {
    const courseMatch = pathname.match(/\/course\/([^/]+)/);
    const moduleMatch = pathname.match(/\/module\/([^/]+)/);
    
    return {
      courseId: courseMatch ? courseMatch[1] : null,
      moduleId: moduleMatch ? moduleMatch[1] : null,
    };
  };

  // Track page view session
  useEffect(() => {
    if (!user) return;

    const startSession = async () => {
      const { courseId, moduleId } = getRouteIds(location.pathname);
      const sessionType = getSessionType(location.pathname);

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_type: sessionType,
          course_id: courseId,
          module_id: moduleId,
          started_at: new Date().toISOString(),
          ip_address: null, // Could be enhanced with IP detection
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (data && !error) {
        sessionIdRef.current = data.id;
        sessionStartRef.current = new Date();
      }
    };

    const endSession = async () => {
      if (sessionIdRef.current) {
        await supabase
          .from('user_sessions')
          .update({
            ended_at: new Date().toISOString(),
          })
          .eq('id', sessionIdRef.current);
        
        sessionIdRef.current = null;
      }
    };

    startSession();

    return () => {
      endSession();
    };
  }, [user, location.pathname]);

  // Track login/logout
  useEffect(() => {
    if (!user) return;

    const trackLogin = async () => {
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        session_type: 'login',
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: 0,
        user_agent: navigator.userAgent,
      });
    };

    trackLogin();

    // Track logout on window close/unload
    const handleBeforeUnload = async () => {
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        session_type: 'logout',
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        duration_seconds: 0,
        user_agent: navigator.userAgent,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  return {
    sessionId: sessionIdRef.current,
    sessionStart: sessionStartRef.current,
  };
}
