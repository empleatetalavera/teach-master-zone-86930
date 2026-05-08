/**
 * Realtime progress bar for a module.
 *
 * Aggregates two signals:
 *  - `unit_progress.overall_progress` for every formative unit in the module
 *  - `scorm_progress.lesson_status` (passed/completed) per SCORM package
 *
 * Subscribes to postgres_changes on both tables filtered by enrollment
 * so the bar refreshes the moment the student commits SCORM data or
 * finishes an activity. Used as a lightweight SEPE/FUNDAE traceability
 * indicator inside `ModuleView`.
 */
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ModuleProgressBarProps {
  moduleId: string;
  enrollmentId: string;
  className?: string;
  /** When false, hides the textual label (use only the bar). */
  showLabel?: boolean;
}

export default function ModuleProgressBar({
  moduleId,
  enrollmentId,
  className,
  showLabel = true,
}: ModuleProgressBarProps) {
  const qc = useQueryClient();
  const queryKey = ["module-progress-bar", moduleId, enrollmentId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      // 1) formative units of the module
      const { data: units } = await supabase
        .from("formative_units")
        .select("id")
        .eq("module_id", moduleId);
      const unitIds = (units ?? []).map((u: any) => u.id);

      // 2) unit_progress for these units
      const { data: unitProgress } = unitIds.length
        ? await supabase
            .from("unit_progress")
            .select("formative_unit_id, overall_progress")
            .eq("enrollment_id", enrollmentId)
            .in("formative_unit_id", unitIds)
        : { data: [] as any[] };

      // 3) SCORM packages bound to this module
      const { data: scormBindings } = await supabase
        .from("module_scorm_content")
        .select("scorm_package_id")
        .eq("module_id", moduleId);
      const packageIds = (scormBindings ?? [])
        .map((b: any) => b.scorm_package_id)
        .filter(Boolean);

      const { data: scormProgress } = packageIds.length
        ? await supabase
            .from("scorm_progress")
            .select("scorm_package_id, lesson_status, completion_status, success_status")
            .eq("enrollment_id", enrollmentId)
            .eq("module_id", moduleId)
            .in("scorm_package_id", packageIds)
        : { data: [] as any[] };

      return {
        unitIds,
        packageIds,
        unitProgress: (unitProgress ?? []) as any[],
        scormProgress: (scormProgress ?? []) as any[],
      };
    },
  });

  // Realtime: invalidate on relevant changes
  useEffect(() => {
    if (!enrollmentId) return;
    const channel = supabase
      .channel(`module-progress-${moduleId}-${enrollmentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "unit_progress", filter: `enrollment_id=eq.${enrollmentId}` },
        () => qc.invalidateQueries({ queryKey }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scorm_progress", filter: `enrollment_id=eq.${enrollmentId}` },
        () => qc.invalidateQueries({ queryKey }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [moduleId, enrollmentId, qc, queryKey.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const percent = useMemo(() => {
    if (!data) return 0;
    const { unitIds, packageIds, unitProgress, scormProgress } = data;
    const totalParts = unitIds.length + packageIds.length;
    if (totalParts === 0) return 0;

    const unitSum = unitIds.reduce((acc, id) => {
      const row = unitProgress.find((u) => u.formative_unit_id === id);
      const v = Math.min(Math.max(Number(row?.overall_progress ?? 0), 0), 100);
      return acc + v;
    }, 0);

    const scormSum = packageIds.reduce((acc, id) => {
      const row = scormProgress.find((s) => s.scorm_package_id === id);
      const status = (row?.lesson_status || row?.completion_status || row?.success_status || "").toLowerCase();
      const done = ["completed", "passed"].includes(status);
      const incomplete = status === "incomplete";
      return acc + (done ? 100 : incomplete ? 50 : 0);
    }, 0);

    return Math.round((unitSum + scormSum) / totalParts);
  }, [data]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        <Loader2 className="h-3 w-3 animate-spin" /> Calculando progreso…
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Progreso del módulo
          </span>
          <span className="font-medium tabular-nums">{percent}%</span>
        </div>
      )}
      <Progress value={percent} className="h-2" />
    </div>
  );
}
