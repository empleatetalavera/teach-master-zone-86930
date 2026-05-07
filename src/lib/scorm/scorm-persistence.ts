/**
 * Persistence layer for SCORM progress in Supabase.
 *
 * Loads previous CMI state to support resume, and upserts the snapshot on
 * every LMSCommit / LMSFinish.
 *
 * Requires:
 *   - Unique index on scorm_progress (user_id, enrollment_id, scorm_package_id, module_id)
 *     See migration: 20260507_scorm_progress_unique_index.sql
 *   - RLS policies: the existing scorm_progress policies are sufficient because
 *     the student writes their own row (auth.uid() = user_id) and teachers/admins
 *     read via the center-scoped policy already in place.
 */

import { supabase } from '@/integrations/supabase/client';
import type { CmiData } from './scorm12-api';

export type ScormProgressKey = {
  userId: string;
  enrollmentId: string;
  scormPackageId: string;
  moduleId: string;
};

export type ScormProgressRow = {
  cmi_data: CmiData | null;
  total_time: string | null;
  lesson_status: string | null;
  score_raw: number | null;
};

/**
 * Load existing progress for the (user, enrollment, package, module) tuple.
 * Returns null if there is no previous attempt (first-time launch).
 */
export async function loadScormProgress(
  key: ScormProgressKey
): Promise<ScormProgressRow | null> {
  const { data, error } = await supabase
    .from('scorm_progress')
    .select('cmi_data, total_time, lesson_status, score_raw')
    .eq('user_id', key.userId)
    .eq('enrollment_id', key.enrollmentId)
    .eq('scorm_package_id', key.scormPackageId)
    .eq('module_id', key.moduleId)
    .maybeSingle();

  if (error) {
    console.error('[SCORM] loadScormProgress error:', error);
    return null;
  }
  return (data as ScormProgressRow | null) ?? null;
}

/**
 * Persist CMI snapshot to scorm_progress. Upserts on the natural key.
 */
export async function saveScormProgress(
  key: ScormProgressKey,
  cmi: CmiData
): Promise<void> {
  const scoreRaw = parseFloat(cmi['cmi.core.score.raw'] ?? '');
  const scoreMin = parseFloat(cmi['cmi.core.score.min'] ?? '');
  const scoreMax = parseFloat(cmi['cmi.core.score.max'] ?? '');
  const lessonStatus = cmi['cmi.core.lesson_status'] ?? null;

  const payload = {
    user_id: key.userId,
    enrollment_id: key.enrollmentId,
    scorm_package_id: key.scormPackageId,
    module_id: key.moduleId,
    cmi_data: cmi,
    lesson_status: lessonStatus,
    score_raw: Number.isFinite(scoreRaw) ? scoreRaw : null,
    score_min: Number.isFinite(scoreMin) ? scoreMin : null,
    score_max: Number.isFinite(scoreMax) ? scoreMax : null,
    session_time: cmi['cmi.core.session_time'] ?? null,
    total_time: cmi['cmi.core.total_time'] ?? null,
    completion_status: deriveCompletionStatus(lessonStatus),
    success_status: deriveSuccessStatus(lessonStatus),
    suspend_data: cmi['cmi.suspend_data'] ?? null,
    last_accessed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('scorm_progress')
    .upsert(payload, {
      onConflict: 'user_id,enrollment_id,scorm_package_id,module_id',
    });

  if (error) {
    console.error('[SCORM] saveScormProgress error:', error);
    throw error;
  }
}

function deriveCompletionStatus(lessonStatus: string | null): string {
  if (!lessonStatus) return 'unknown';
  if (lessonStatus === 'completed' || lessonStatus === 'passed' || lessonStatus === 'failed') {
    return 'completed';
  }
  if (lessonStatus === 'incomplete' || lessonStatus === 'browsed') {
    return 'incomplete';
  }
  return 'not attempted';
}

function deriveSuccessStatus(lessonStatus: string | null): string {
  if (lessonStatus === 'passed') return 'passed';
  if (lessonStatus === 'failed') return 'failed';
  return 'unknown';
}
