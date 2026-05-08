import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ScormProPlayer from "@/components/scorm/ScormProPlayer";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScormFullscreen() {
  const { enrollmentId, moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const unitId = searchParams.get("unitId") || undefined;
  const titleParam = searchParams.get("title") || "Contenido Interactivo";

  const [loading, setLoading] = useState(true);
  const [pkg, setPkg] = useState<{ id: string; title: string; file_path: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = titleParam;
  }, [titleParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!moduleId) return;
      try {
        let q = supabase
          .from("module_scorm_content")
          .select("scorm_packages(id, title, file_path)")
          .eq("module_id", moduleId);
        if (unitId) q = q.eq("formative_unit_id", unitId);
        const { data, error } = await q.limit(1).maybeSingle();
        if (error) throw error;
        const sp: any = (data as any)?.scorm_packages;
        if (!sp) {
          setError("No hay contenido SCORM disponible para esta unidad.");
        } else if (!cancelled) {
          setPkg({ id: sp.id, title: sp.title, file_path: sp.file_path });
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Error cargando contenido");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId, unitId]);

  const exit = () => (window.history.length > 1 ? navigate(-1) : window.close());

  if (!enrollmentId || !moduleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Parámetros inválidos.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground max-w-md">{error || "Sin contenido"}</p>
        <Button onClick={exit}>Volver</Button>
      </div>
    );
  }

  return (
    <ScormProPlayer
      packageId={pkg.id}
      filePath={pkg.file_path}
      packageTitle={titleParam || pkg.title}
      enrollmentId={enrollmentId}
      moduleId={moduleId}
      onExit={exit}
    />
  );
}
