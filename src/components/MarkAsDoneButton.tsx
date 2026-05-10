import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface Props {
  itemType: "activity" | "quiz";
  itemId: string;
  courseId?: string;
  size?: "sm" | "default";
  className?: string;
  /** Stop propagation when wrapped inside a clickable parent (e.g. UFActivitiesList row). */
  stopPropagation?: boolean;
}

export function MarkAsDoneButton({
  itemType,
  itemId,
  courseId,
  size = "sm",
  className,
  stopPropagation,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setLoading(false); return; }
      const { data } = await (supabase as any)
        .from("student_item_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();
      if (active) {
        setDone(!!data);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.id, itemType, itemId]);

  const toggle = async (e: React.MouseEvent) => {
    if (stopPropagation) { e.preventDefault(); e.stopPropagation(); }
    if (!user || saving) return;
    setSaving(true);
    try {
      if (done) {
        const { error } = await (supabase as any)
          .from("student_item_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", itemType)
          .eq("item_id", itemId);
        if (error) throw error;
        setDone(false);
        toast({ title: "Marca retirada", description: "Has desmarcado este elemento." });
      } else {
        const { error } = await (supabase as any)
          .from("student_item_completions")
          .insert({ user_id: user.id, item_type: itemType, item_id: itemId, course_id: courseId ?? null });
        if (error) throw error;
        setDone(true);
        toast({ title: "¡Marcado como realizado!", description: "Tu progreso se ha guardado." });
      }
    } catch (err: any) {
      console.error("MarkAsDoneButton error", err);
      toast({ title: "Error", description: "No se pudo guardar la marca.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={done ? "default" : "outline"}
      size={size}
      onClick={toggle}
      disabled={saving}
      className={className}
      title={done ? "Marcado como realizado — pulsa para desmarcar" : "Marcar como realizado"}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <CheckCircle2 className="h-4 w-4 mr-1.5" />
      ) : (
        <Circle className="h-4 w-4 mr-1.5" />
      )}
      {done ? "Realizado" : "Marcar como realizado"}
    </Button>
  );
}
