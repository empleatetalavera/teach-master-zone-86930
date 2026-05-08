/**
 * ModuleDownloads — Gestor de descargas del módulo (Fase C SEPE).
 *
 * Lista todos los recursos descargables (manual_pdf, supplementary, attachments)
 * del módulo y, al pulsar "Descargar", registra una entrada en
 * `resource_access_log` con `resource_type = 'download'` para trazabilidad.
 *
 * Entrega los archivos vía fetch -> Blob -> ObjectURL para evitar bloqueo de
 * popup en Chrome/Firefox y mantener el nombre real del archivo.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, ExternalLink, FileArchive } from "lucide-react";

interface ModuleContentRow {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_path: string | null;
  external_url: string | null;
  embed_url: string | null;
  order_index: number;
  created_at: string;
}

interface Props {
  moduleId: string;
  enrollmentId?: string;
  courseId?: string;
}

const DOWNLOADABLE_TYPES = ["manual_pdf", "supplementary", "attachment", "document", "pdf"];

const TYPE_LABEL: Record<string, string> = {
  manual_pdf: "Manual PDF",
  supplementary: "Material complementario",
  attachment: "Adjunto",
  document: "Documento",
  pdf: "PDF",
};

export default function ModuleDownloads({ moduleId, enrollmentId, courseId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ModuleContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("module_content")
        .select("id,title,description,content_type,file_path,external_url,embed_url,order_index,created_at")
        .eq("module_id", moduleId)
        .in("content_type", DOWNLOADABLE_TYPES)
        .order("order_index", { ascending: true });
      if (!cancel) {
        if (error) {
          console.error("[ModuleDownloads] load failed:", error);
          setItems([]);
        } else {
          setItems((data as ModuleContentRow[]) || []);
        }
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [moduleId]);

  const trackDownload = async (item: ModuleContentRow) => {
    if (!user) return;
    try {
      await supabase.from("resource_access_log").insert({
        user_id: user.id,
        enrollment_id: enrollmentId ?? null,
        course_id: courseId ?? null,
        module_id: moduleId,
        resource_type: "download",
        resource_id: item.id,
        resource_label: item.title,
        entered_at: new Date().toISOString(),
        left_at: new Date().toISOString(),
        active_seconds: 0,
        user_agent: navigator.userAgent,
      });
    } catch (e) {
      console.warn("[ModuleDownloads] tracking failed:", e);
    }
  };

  const resolveUrl = async (item: ModuleContentRow): Promise<string | null> => {
    if (item.file_path) {
      const { data } = supabase.storage.from("module-content").getPublicUrl(item.file_path);
      return data?.publicUrl ?? null;
    }
    return item.external_url || item.embed_url || null;
  };

  const handleDownload = async (item: ModuleContentRow) => {
    setDownloadingId(item.id);
    try {
      const url = await resolveUrl(item);
      if (!url) throw new Error("Recurso sin URL disponible");

      await trackDownload(item);

      // fetch -> blob -> object URL (evita popup blocker)
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const filename =
        item.file_path?.split("/").pop() ||
        `${item.title.replace(/[^\w.-]+/g, "_")}.pdf`;

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (err: any) {
      console.error("[ModuleDownloads] download failed:", err);
      toast({
        title: "No se pudo descargar",
        description: err?.message ?? "Inténtalo de nuevo",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenExternal = async (item: ModuleContentRow) => {
    const url = item.external_url || item.embed_url;
    if (!url) return;
    await trackDownload(item);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileArchive className="h-5 w-5 text-primary" />
          Descargas del módulo
        </CardTitle>
        <CardDescription>
          Manuales, materiales complementarios y documentos descargables. Cada descarga
          queda registrada en el expediente del alumno.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando recursos…
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay recursos descargables en este módulo</p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((item) => {
              const isExternal = !item.file_path && (item.external_url || item.embed_url);
              const busy = downloadingId === item.id;
              return (
                <li
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {TYPE_LABEL[item.content_type] ?? item.content_type}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    {isExternal ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenExternal(item)}
                        className="w-full sm:w-auto"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleDownload(item)}
                        disabled={busy}
                        className="w-full sm:w-auto"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Descargar
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
