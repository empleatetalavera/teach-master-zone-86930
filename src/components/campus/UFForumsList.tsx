import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, HelpCircle, Plus, ChevronRight } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  category: string;
  views_count: number | null;
}

interface Props {
  courseId: string;
  moduleId: string;
  formativeUnitId: string;
  isAdmin: boolean;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  debate: { label: "Foro de debate", icon: <MessageSquare className="h-4 w-4" />, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600" },
  dudas_contenido: { label: "Dudas / consultas del contenido", icon: <HelpCircle className="h-4 w-4" />, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600" },
  dudas_actividades: { label: "Programación / dudas de actividades", icon: <HelpCircle className="h-4 w-4" />, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600" },
  dudas_tecnicas: { label: "Dudas / consultas técnicas", icon: <HelpCircle className="h-4 w-4" />, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600" },
  general: { label: "Foro general", icon: <MessageSquare className="h-4 w-4" />, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600" },
};

export function UFForumsList({ courseId, moduleId, formativeUnitId, isAdmin }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("debate");

  const load = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("forum_topics")
      .select("id,title,category,views_count")
      .eq("module_id", moduleId)
      .eq("formative_unit_id", formativeUnitId)
      .order("created_at", { ascending: true });
    setTopics((data ?? []) as Topic[]);
  }, [moduleId, formativeUnitId]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!title.trim()) { toast({ title: "Falta título", variant: "destructive" }); return; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await (supabase as any).from("forum_topics").insert({
      course_id: courseId,
      module_id: moduleId,
      formative_unit_id: formativeUnitId,
      title: title.trim(),
      content: "",
      category,
      created_by: u?.user?.id,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTitle(""); setCategory("debate"); setOpen(false);
    load();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
          💬 Foros
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Plus className="h-3 w-3" />Crear foro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Crear foro de la UF</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_META).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={create}>Crear</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {topics.length === 0 ? (
        <div className="text-xs text-muted-foreground italic px-3 py-2 border border-dashed rounded-lg">
          Sin foros de esta UF {isAdmin && "— crea un foro de debate o de dudas."}
        </div>
      ) : (
        <div className="space-y-1.5">
          {topics.map(t => {
            const meta = CATEGORY_META[t.category] || CATEGORY_META.general;
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/course/${courseId}?tab=foros&topic=${t.id}`)}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card hover:border-orange-400/60 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 transition"
              >
                <div className={`p-1.5 rounded ${meta.bg} shrink-0`}>
                  <div className={meta.color}>{meta.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground">{meta.label}</div>
                </div>
                {(t.views_count ?? 0) > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{t.views_count} vistas</Badge>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
