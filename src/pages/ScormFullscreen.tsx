import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ScormPlayer from "@/components/scorm/ScormPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2 } from "lucide-react";

export default function ScormFullscreen() {
  const { enrollmentId, moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const unitId = searchParams.get("unitId") || undefined;
  const title = searchParams.get("title") || "Contenido Interactivo";

  useEffect(() => {
    document.title = title;
  }, [title]);

  const requestFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  };

  if (!enrollmentId || !moduleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Parámetros inválidos.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-50">
      <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => (window.history.length > 1 ? navigate(-1) : window.close())}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <h1 className="text-sm sm:text-base font-semibold truncate">{title}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={requestFullscreen}>
          <Maximize2 className="h-4 w-4 mr-1" /> Pantalla completa
        </Button>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="h-full w-full p-2 sm:p-4">
          <ScormPlayer
            moduleId={moduleId}
            enrollmentId={enrollmentId}
            formativeUnitId={unitId}
            autoStart
          />
        </div>
      </main>
    </div>
  );
}
