/**
 * useResourceTracker — Trazabilidad SEPE.
 *
 * Registra una fila en `resource_access_log` cuando el alumno entra en un
 * recurso (SCORM, PDF, vídeo, evaluación, descarga...) y va actualizando
 * `active_seconds` cada 30 s mientras la pestaña esté visible y el alumno
 * interactúe (movimiento de ratón / teclado / scroll).
 *
 * Cuando el componente se desmonta o la pestaña se cierra, escribe `left_at`.
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export type ResourceTrackerOptions = {
  resourceType: "scorm" | "pdf" | "video" | "quiz" | "activity" | "download" | "page" | "forum" | "chat" | "glossary";
  resourceId?: string;
  resourceLabel?: string;
  enrollmentId?: string;
  courseId?: string;
  moduleId?: string;
  unitId?: string;
  /** Si es false, no hace nada. Útil para esperar a tener datos. */
  enabled?: boolean;
};

const HEARTBEAT_MS = 30_000;
const IDLE_THRESHOLD_MS = 90_000;

export function useResourceTracker({
  resourceType,
  resourceId,
  resourceLabel,
  enrollmentId,
  courseId,
  moduleId,
  unitId,
  enabled = true,
}: ResourceTrackerOptions) {
  const { user } = useAuth();
  const rowIdRef = useRef<string | null>(null);
  const activeSecondsRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !user) return;
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let heartbeat: number | null = null;

    const onActivity = () => { lastActivityRef.current = Date.now(); };
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    (async () => {
      const { data, error } = await supabase
        .from("resource_access_log")
        .insert({
          user_id: user.id,
          enrollment_id: enrollmentId ?? null,
          course_id: courseId ?? null,
          module_id: moduleId ?? null,
          unit_id: unitId ?? null,
          resource_type: resourceType,
          resource_id: resourceId ?? null,
          resource_label: resourceLabel ?? null,
          entered_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
        })
        .select("id")
        .single();

      if (error) {
        console.error("[useResourceTracker] insert failed:", error);
        return;
      }
      if (cancelled) return;
      rowIdRef.current = data.id;

      events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

      heartbeat = window.setInterval(async () => {
        const idleMs = Date.now() - lastActivityRef.current;
        if (document.visibilityState === "visible" && idleMs < IDLE_THRESHOLD_MS) {
          activeSecondsRef.current += Math.floor(HEARTBEAT_MS / 1000);
        }
        if (rowIdRef.current) {
          await supabase
            .from("resource_access_log")
            .update({ active_seconds: activeSecondsRef.current })
            .eq("id", rowIdRef.current);
        }
      }, HEARTBEAT_MS);
    })();

    const finish = async () => {
      if (!rowIdRef.current) return;
      await supabase
        .from("resource_access_log")
        .update({
          active_seconds: activeSecondsRef.current,
          left_at: new Date().toISOString(),
        })
        .eq("id", rowIdRef.current);
    };

    const onUnload = () => { void finish(); };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, onActivity));
      window.removeEventListener("beforeunload", onUnload);
      if (heartbeat) window.clearInterval(heartbeat);
      void finish();
      startedRef.current = false;
      rowIdRef.current = null;
      activeSecondsRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, user?.id, resourceType, resourceId, courseId, moduleId, unitId, enrollmentId]);
}
