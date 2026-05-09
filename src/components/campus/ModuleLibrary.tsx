import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddResourceDialog } from "./AddResourceDialog";
import { Library, Search, ExternalLink, Plus, Trash2 } from "lucide-react";

interface Row {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
}

interface Props {
  moduleId: string;
  isAdmin: boolean;
}

export function ModuleLibrary({ moduleId, isAdmin }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("module_content")
      .select("id,title,description,file_path,external_url")
      .eq("module_id", moduleId)
      .eq("content_type", "biblioteca")
      .is("formative_unit_id", null)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  }, [moduleId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(r => r.title.toLowerCase().includes(s) || (r.description ?? "").toLowerCase().includes(s));
  }, [rows, q]);

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
        <span className="flex items-center gap-2"><Library className="h-3.5 w-3.5" />BIBLIOTECA</span>
        <span className="text-[10px] opacity-90">{rows.length} recursos</span>
      </div>
      <div className="p-3 space-y-2 bg-pink-50/30 dark:bg-pink-950/10">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-8 pl-7 text-sm" placeholder="Buscar por palabra clave, área, título…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {isAdmin && (
            <AddResourceDialog
              trigger={<Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Plus className="h-3 w-3" />Añadir</Button>}
              contentType="biblioteca"
              moduleId={moduleId}
              formativeUnitId={null}
              onCreated={load}
            />
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-xs text-muted-foreground italic px-3 py-2 border border-dashed rounded-lg">
            {rows.length === 0 ? "Biblioteca vacía" : "Sin resultados"}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition">
                <div className="p-1.5 rounded bg-pink-100 dark:bg-pink-900/30 shrink-0">
                  <Library className="h-4 w-4 text-pink-600" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
