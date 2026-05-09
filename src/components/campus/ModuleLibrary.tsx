import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddResourceDialog } from "./AddResourceDialog";
import { Library, Search, ExternalLink, Plus, Trash2, Globe, BookOpen, Clock } from "lucide-react";

interface Row {
  id: string;
  title: string;
  description: string | null;
  comment: string | null;
  study_time_minutes: number | null;
  file_path: string | null;
  external_url: string | null;
  content_type: "biblioteca" | "web_link";
  formative_unit_id: string | null;
}

interface UFRow { id: string; title: string; sort_order: number | null }

interface Props {
  moduleId: string;
  isAdmin: boolean;
}

export function ModuleLibrary({ moduleId, isAdmin }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [ufs, setUfs] = useState<UFRow[]>([]);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const [{ data: contentData }, { data: ufData }] = await Promise.all([
      (supabase as any)
        .from("module_content")
        .select("id,title,description,comment,study_time_minutes,file_path,external_url,content_type,formative_unit_id")
        .eq("module_id", moduleId)
        .in("content_type", ["biblioteca", "web_link"])
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("formative_units")
        .select("id,title,sort_order")
        .eq("module_id", moduleId)
        .order("sort_order", { ascending: true }),
    ]);
    setRows((contentData ?? []) as Row[]);
    setUfs((ufData ?? []) as UFRow[]);
  }, [moduleId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(r =>
      r.title.toLowerCase().includes(s) ||
      (r.description ?? "").toLowerCase().includes(s) ||
      (r.comment ?? "").toLowerCase().includes(s)
    );
  }, [rows, q]);

  // Group by UF
  const grouped = useMemo(() => {
    const ufMap = new Map<string | null, { label: string; items: Row[] }>();
    ufMap.set(null, { label: "General del módulo", items: [] });
    ufs.forEach(uf => ufMap.set(uf.id, { label: uf.title, items: [] }));
    filtered.forEach(r => {
      const key = r.formative_unit_id;
      const bucket = ufMap.get(key) ?? ufMap.get(null)!;
      bucket.items.push(r);
    });
    return Array.from(ufMap.entries()).filter(([, v]) => v.items.length > 0);
  }, [filtered, ufs]);

  const open = async (r: Row) => {
    try {
      if (r.external_url) { window.open(r.external_url, "_blank", "noopener,noreferrer"); return; }
      if (!r.file_path) return;
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
    if (!confirm("¿Eliminar entrada?")) return;
    await (supabase as any).from("module_content").delete().eq("id", id);
    load();
  };

  return (
    <div className="border border-pink-200/60 dark:border-pink-900/40 rounded-xl overflow-hidden mt-3">
      <div className="bg-gradient-to-r from-[#a13a72] to-[#c44d8a] text-white px-4 py-2.5 font-semibold text-xs uppercase tracking-wider flex items-center justify-between">
        <span className="flex items-center gap-2"><Library className="h-3.5 w-3.5" />BIBLIOTECA Y ENLACES</span>
        <span className="text-[10px] opacity-90">{rows.length} recursos</span>
      </div>
      <div className="p-3 space-y-3 bg-pink-50/30 dark:bg-pink-950/10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-8 pl-7 text-sm" placeholder="Buscar por título, descripción o comentario…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {isAdmin && (
            <>
              <AddResourceDialog
                trigger={<Button variant="outline" size="sm" className="h-8 text-xs gap-1"><BookOpen className="h-3 w-3" />Bibliografía</Button>}
                contentType="biblioteca"
                moduleId={moduleId}
                formativeUnitId={null}
                onCreated={load}
              />
              <AddResourceDialog
                trigger={<Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Globe className="h-3 w-3" />Enlace web</Button>}
                contentType="web_link"
                moduleId={moduleId}
                formativeUnitId={null}
                onCreated={load}
              />
            </>
          )}
        </div>

        {grouped.length === 0 ? (
          <div className="text-xs text-muted-foreground italic px-3 py-2 border border-dashed rounded-lg">
            {rows.length === 0 ? "Biblioteca vacía" : "Sin resultados"}
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map(([key, group]) => (
              <div key={key ?? "general"} className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 px-1">
                  {group.label}
                </div>
                {group.items.map(r => {
                  const isLink = r.content_type === "web_link" || (!r.file_path && !!r.external_url);
                  const Icon = isLink ? Globe : Library;
                  return (
                    <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition">
                      <div className="p-1.5 rounded bg-pink-100 dark:bg-pink-900/30 shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-pink-600" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-medium truncate">{r.title}</div>
                          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                            {r.content_type === "web_link" ? "Enlace web" : "Bibliografía"}
                          </Badge>
                          {r.study_time_minutes ? (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-0.5">
                              <Clock className="h-2.5 w-2.5" />{r.study_time_minutes} min
                            </Badge>
                          ) : null}
                        </div>
                        {r.description && <div className="text-xs text-muted-foreground">{r.description}</div>}
                        {r.comment && (
                          <div className="text-xs italic text-foreground/80 border-l-2 border-pink-400/60 pl-2">
                            {r.comment}
                          </div>
                        )}
                        {r.external_url && (
                          <div className="text-[11px] text-pink-700 dark:text-pink-300 truncate">{r.external_url}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => open(r)}>
                          <ExternalLink className="h-3 w-3" />Abrir
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(r.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
