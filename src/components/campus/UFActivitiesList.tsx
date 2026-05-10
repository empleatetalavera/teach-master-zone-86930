import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, ChevronRight, Plus, Calendar } from "lucide-react";
import { MarkAsDoneButton } from "@/components/MarkAsDoneButton";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number | null;
  is_active: boolean;
}

interface Props {
  courseId: string;
  moduleId: string;
  formativeUnitId: string;
  isAdmin: boolean;
  onOpenActivityManager: (unitId: string, unitTitle: string) => void;
  formativeUnitTitle: string;
}

export function UFActivitiesList({ courseId, moduleId, formativeUnitId, isAdmin, onOpenActivityManager, formativeUnitTitle }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [acts, setActs] = useState<Activity[]>([]);

  const load = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("development_activities")
      .select("id,title,description,due_date,max_score,is_active")
      .eq("formative_unit_id", formativeUnitId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    setActs((data ?? []) as Activity[]);
  }, [formativeUnitId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400">
          ✏️ Actividades de Aprendizaje Evaluables
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onOpenActivityManager(formativeUnitId, formativeUnitTitle)}>
            <Plus className="h-3 w-3" />Gestionar
          </Button>
        )}
      </div>

      {acts.length === 0 ? (
        <div className="text-xs text-muted-foreground italic px-3 py-2 border border-dashed rounded-lg">
          Sin actividades configuradas {isAdmin && "— añade actividades evaluables para esta UF."}
        </div>
      ) : (
        <div className="space-y-1.5">
          {acts.map((a, i) => (
            <div
              key={a.id}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card hover:border-green-400/60 hover:bg-green-50/40 dark:hover:bg-green-950/20 transition"
            >
              <button
                onClick={() => onOpenActivityManager(formativeUnitId, formativeUnitTitle)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30 shrink-0">
                  <PenTool className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    Actividad {i + 1} — {a.title}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    {a.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Entrega: {new Date(a.due_date).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    {a.max_score != null && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Máx. {a.max_score}</Badge>}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
              {!isAdmin && (
                <MarkAsDoneButton
                  itemType="activity"
                  itemId={a.id}
                  courseId={courseId}
                  stopPropagation
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
