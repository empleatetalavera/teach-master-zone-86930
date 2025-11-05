import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

interface ContentTrackerProps {
  moduleId: string;
  enrollmentId: string;
  enabled?: boolean;
}

export function useContentTracker({ moduleId, enrollmentId, enabled = true }: ContentTrackerProps) {
  const { user } = useAuth();
  const interactionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const timeSpentRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start tracking
  useEffect(() => {
    if (!user || !enabled || !moduleId || !enrollmentId) return;

    const startTracking = async () => {
      const { data, error } = await supabase
        .from('content_interactions')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          enrollment_id: enrollmentId,
          interaction_type: 'view',
          time_spent_seconds: 0,
          sequence_position: 0,
        })
        .select()
        .single();

      if (data && !error) {
        interactionIdRef.current = data.id;
        startTimeRef.current = new Date();
        timeSpentRef.current = 0;

        // Update time spent every 10 seconds
        intervalRef.current = setInterval(async () => {
          timeSpentRef.current += 10;
          
          if (interactionIdRef.current) {
            await supabase
              .from('content_interactions')
              .update({
                time_spent_seconds: timeSpentRef.current,
              })
              .eq('id', interactionIdRef.current);
          }
        }, 10000);
      }
    };

    startTracking();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Final update on unmount
      if (interactionIdRef.current && timeSpentRef.current > 0) {
        supabase
          .from('content_interactions')
          .update({
            time_spent_seconds: timeSpentRef.current,
          })
          .eq('id', interactionIdRef.current);
      }
    };
  }, [user, moduleId, enrollmentId, enabled]);

  const markAsCompleted = useCallback(async () => {
    if (!interactionIdRef.current) return;

    await supabase
      .from('content_interactions')
      .update({
        completed: true,
        interaction_type: 'complete',
        time_spent_seconds: timeSpentRef.current,
      })
      .eq('id', interactionIdRef.current);
  }, []);

  const trackPause = useCallback(async () => {
    if (!user || !moduleId || !enrollmentId) return;

    await supabase.from('content_interactions').insert({
      user_id: user.id,
      module_id: moduleId,
      enrollment_id: enrollmentId,
      interaction_type: 'pause',
      time_spent_seconds: 0,
    });
  }, [user, moduleId, enrollmentId]);

  const trackResume = useCallback(async () => {
    if (!user || !moduleId || !enrollmentId) return;

    await supabase.from('content_interactions').insert({
      user_id: user.id,
      module_id: moduleId,
      enrollment_id: enrollmentId,
      interaction_type: 'resume',
      time_spent_seconds: 0,
    });
  }, [user, moduleId, enrollmentId]);

  return {
    markAsCompleted,
    trackPause,
    trackResume,
    timeSpent: timeSpentRef.current,
  };
}
