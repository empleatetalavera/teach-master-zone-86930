import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface UnitProgressData {
  formative_unit_id: string;
  content_progress: number;
  activities_progress: number;
  overall_progress: number;
}

interface UseUnitProgressProps {
  enrollmentId: string | null;
  formativeUnitIds: string[];
}

export function useUnitProgress({ enrollmentId, formativeUnitIds }: UseUnitProgressProps) {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<Record<string, UnitProgressData>>({});
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!user || !enrollmentId || formativeUnitIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('unit_progress')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .in('formative_unit_id', formativeUnitIds);

      if (error) throw error;

      const progressMap: Record<string, UnitProgressData> = {};
      data?.forEach((item: any) => {
        progressMap[item.formative_unit_id] = {
          formative_unit_id: item.formative_unit_id,
          content_progress: item.content_progress || 0,
          activities_progress: item.activities_progress || 0,
          overall_progress: item.overall_progress || 0,
        };
      });

      // Add missing units with 0 progress
      formativeUnitIds.forEach((id) => {
        if (!progressMap[id]) {
          progressMap[id] = {
            formative_unit_id: id,
            content_progress: 0,
            activities_progress: 0,
            overall_progress: 0,
          };
        }
      });

      setProgressData(progressMap);
    } catch (error) {
      console.error('Error loading unit progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user, enrollmentId, formativeUnitIds]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const updateContentProgress = useCallback(async (formativeUnitId: string, progress: number) => {
    if (!user || !enrollmentId) return;

    const currentData = progressData[formativeUnitId] || {
      content_progress: 0,
      activities_progress: 0,
      overall_progress: 0,
    };

    const newContentProgress = Math.min(100, Math.max(0, progress));
    const newOverallProgress = Math.round((newContentProgress + currentData.activities_progress) / 2);

    try {
      const { error } = await supabase
        .from('unit_progress')
        .upsert({
          user_id: user.id,
          enrollment_id: enrollmentId,
          formative_unit_id: formativeUnitId,
          content_progress: newContentProgress,
          activities_progress: currentData.activities_progress,
          overall_progress: newOverallProgress,
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'enrollment_id,formative_unit_id',
        });

      if (error) throw error;

      setProgressData((prev) => ({
        ...prev,
        [formativeUnitId]: {
          formative_unit_id: formativeUnitId,
          content_progress: newContentProgress,
          activities_progress: currentData.activities_progress,
          overall_progress: newOverallProgress,
        },
      }));
    } catch (error) {
      console.error('Error updating content progress:', error);
    }
  }, [user, enrollmentId, progressData]);

  const updateActivityProgress = useCallback(async (formativeUnitId: string, progress: number) => {
    if (!user || !enrollmentId) return;

    const currentData = progressData[formativeUnitId] || {
      content_progress: 0,
      activities_progress: 0,
      overall_progress: 0,
    };

    const newActivityProgress = Math.min(100, Math.max(0, progress));
    const newOverallProgress = Math.round((currentData.content_progress + newActivityProgress) / 2);

    try {
      const { error } = await supabase
        .from('unit_progress')
        .upsert({
          user_id: user.id,
          enrollment_id: enrollmentId,
          formative_unit_id: formativeUnitId,
          content_progress: currentData.content_progress,
          activities_progress: newActivityProgress,
          overall_progress: newOverallProgress,
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'enrollment_id,formative_unit_id',
        });

      if (error) throw error;

      setProgressData((prev) => ({
        ...prev,
        [formativeUnitId]: {
          formative_unit_id: formativeUnitId,
          content_progress: currentData.content_progress,
          activities_progress: newActivityProgress,
          overall_progress: newOverallProgress,
        },
      }));
    } catch (error) {
      console.error('Error updating activity progress:', error);
    }
  }, [user, enrollmentId, progressData]);

  const getUnitProgress = useCallback((formativeUnitId: string) => {
    return progressData[formativeUnitId] || {
      formative_unit_id: formativeUnitId,
      content_progress: 0,
      activities_progress: 0,
      overall_progress: 0,
    };
  }, [progressData]);

  return {
    progressData,
    loading,
    updateContentProgress,
    updateActivityProgress,
    getUnitProgress,
    refreshProgress: loadProgress,
  };
}
