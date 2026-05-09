import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AddResourceDialog, ResourceContentType } from "./AddResourceDialog";
import { FileText, Video, Volume2, ExternalLink, Plus, Trash2 } from "lucide-react";

interface Props {
  moduleId: string;
  courseId: string;
  formativeUnitId: string;
  isAdmin: boolean;
}

interface Row {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
  content_type: string;
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string; accept: string }> = {
  support_doc: { label: "Documento de apoyo", icon: <FileText className="h-4 w-4" />, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600", accept: "application/pdf,.doc,.docx,.txt" },
  support_video: { label: "Vídeo de apoyo", icon: <Video className="h-4 w-4" />, bg: "bg-rose-100 dark:bg-rose-900/30", color: "text-rose-600", accept: "video/*" },
  support_audio: { label: "Audio de apoyo", icon: <Volume2 className="h-4 w-4" />, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-600", accept: "audio/*" },
};

export function SupplementaryMaterialList({ moduleId, courseId, formativeUnitId, isAdmin }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("module_content")
      .select("id,title,description,file_path,external_url,content_type")
      .eq("formative_unit_id", formativeUnitId)
      .in("content_type", ["support_doc", "support_video", "support_audio"])
      .order("created_at", { ascending: true });
    setRows((data ?? []) as Row[]);
  }, [formativeUnitId]);

  useEffect(() => { load(); }, [load]);

  const open = async (r: Row) => {
    try {
      if (r.external_url) { window.open(r.external_url, "_blank", "noopener,noreferrer"); return; }
      if (!r.file_path) { toast({ title: "Sin contenido" }); return; }
      const { data, error } = await supabase.storage.from("module-content").createSignedUrl(r.file_path, 3600);
      if (error) throw error;
      const blob = await (await fetch(data.signedUrl)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message, variant: "destructive" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar recurso?")) return;
    await (supabase as any).from("module_content").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          📚 Material Complementario
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1.5">
            {(["support_doc","support_video","support_audio"] as ResourceContentType[]).map(t => (
              <AddResourceDialog
                key={t}
                trigger={
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Plus className="h-3 w-3" />{TYPE_META[t].label.split(" ")[0]}
                  </Button>
                }
                contentType={t}
                moduleId={moduleId}
                courseId={courseId}
                formativeUnitId={formativeUnitId}
                acceptFile={TYPE_META[t].accept}
                onCreated={load}
              />
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-xs text-muted-foreground italic px-3 py-2 border border-dashed rounded-lg">
          Sin material complementario {isAdmin && "— añade documentos, vídeos o audios de apoyo."}
        </div>
      ) : (
        <div className="grid gap-1.5">
          {rows.map(r => {
            const meta = TYPE_META[r.content_type] || TYPE_META.support_doc;
            return (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors">
                <div className={`p-1.5 rounded ${meta.bg} shrink-0`}>
                  <div className={meta.color}>{meta.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  {r.description && <div className="text-xs text-muted-foreground truncate">{r.description}</div>}
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => open(r)}>
                  <ExternalLink className="h-3 w-3" />Abrir
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
