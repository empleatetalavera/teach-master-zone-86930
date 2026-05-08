/**
 * Professional SCORM Player — replica del estilo Campus Vértice.
 *
 * Layout:
 *  - Header minimal: Home (volver) | Título | Guardar/Salir
 *  - Sidebar vertical de iconos colapsable (chat, descargas, evaluaciones,
 *    tareas, calificaciones, audio, vídeo, glosario, apuntes, imprimir, ayuda)
 *  - Centro: iframe a pantalla completa
 *  - Footer: paginación (anterior / página X de N / siguiente) + barra de progreso verde
 *  - Botón flotante del asistente IA (Vega) abajo a la derecha
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Save,
  MessageCircle,
  Download,
  ClipboardList,
  CheckSquare,
  BarChart3,
  Headphones,
  PlaySquare,
  Asterisk,
  StickyNote,
  Printer,
  Plus,
  HelpCircle,
  Loader2,
  AlertCircle,
  ChevronRight as ChevronRightTab,
  Bot,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { CmiData } from "@/lib/scorm/scorm12-api";
import {
  attachScormBridge,
  secondsToScorm12Time,
  secondsToScorm2004Time,
  type ScormBridgeHandle,
} from "@/lib/scorm/scorm-again-bridge";
import { loadScormProgress, saveScormProgress } from "@/lib/scorm/scorm-persistence";
import { loadScormPackage, type ScormRuntimeHandle, type ScormTreeItem } from "@/lib/scorm/scorm-runtime";
import { useResourceTracker } from "@/hooks/useResourceTracker";
import { useToast } from "@/hooks/use-toast";
import VegaAssistant from "./VegaAssistant";
import { ModuleChat } from "@/components/ModuleChat";
import { CourseGlossary } from "@/components/CourseGlossary";

type Props = {
  packageId: string;
  filePath: string;
  packageTitle: string;
  enrollmentId: string;
  moduleId: string;
  onExit: () => void;
  userId?: string;
  studentName?: string;
};

type FlatLeaf = { id: string; title: string; href: string };

function flattenLeaves(tree: ScormTreeItem[], out: FlatLeaf[] = []): FlatLeaf[] {
  for (const node of tree) {
    if (node.href) out.push({ id: node.id, title: node.title, href: node.href });
    if (node.children.length) flattenLeaves(node.children, out);
  }
  return out;
}

type ToolKey =
  | "index"
  | "chat"
  | "downloads"
  | "evaluations"
  | "tasks"
  | "grades"
  | "audio"
  | "video"
  | "glossary"
  | "notes"
  | "print"
  | "help";

type ToolDef = { key: ToolKey; label: string; icon: typeof Home; bg: string; fg: string };

const TOOLS: ToolDef[] = [
  { key: "index",       label: "Índice",        icon: ClipboardList, bg: "bg-slate-100",   fg: "text-slate-600" },
  { key: "chat",        label: "Chat",          icon: MessageCircle, bg: "bg-sky-100",     fg: "text-sky-600" },
  { key: "downloads",   label: "Descargas",     icon: Download,      bg: "bg-rose-100",    fg: "text-rose-600" },
  { key: "evaluations", label: "Evaluaciones",  icon: ClipboardList, bg: "bg-orange-100",  fg: "text-orange-600" },
  { key: "tasks",       label: "Tareas",        icon: CheckSquare,   bg: "bg-emerald-100", fg: "text-emerald-600" },
  { key: "grades",      label: "Calificaciones",icon: BarChart3,     bg: "bg-amber-100",   fg: "text-amber-600" },
  { key: "audio",       label: "Audio",         icon: Headphones,    bg: "bg-teal-100",    fg: "text-teal-600" },
  { key: "video",       label: "Vídeo",         icon: PlaySquare,    bg: "bg-pink-100",    fg: "text-pink-600" },
  { key: "glossary",    label: "Glosario",      icon: Asterisk,      bg: "bg-slate-100",   fg: "text-slate-600" },
  { key: "notes",       label: "Apuntes",       icon: StickyNote,    bg: "bg-slate-100",   fg: "text-slate-600" },
  { key: "print",       label: "Imprimir",      icon: Printer,       bg: "bg-slate-100",   fg: "text-slate-600" },
  { key: "help",        label: "Ayuda",         icon: HelpCircle,    bg: "bg-slate-100",   fg: "text-slate-600" },
];

export default function ScormProPlayer({
  packageId, filePath, packageTitle, enrollmentId, moduleId, onExit,
  userId: userIdProp, studentName: studentNameProp,
}: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const handleRef = useRef<ScormRuntimeHandle | null>(null);
  const bridgeRef = useRef<ScormBridgeHandle | null>(null);

  const [identity, setIdentity] = useState<{ userId: string; studentName: string } | null>(null);
  const [tree, setTree] = useState<ScormTreeItem[]>([]);
  const [courseTitle, setCourseTitle] = useState(packageTitle);
  const [baseSrc, setBaseSrc] = useState("");
  const [currentHref, setCurrentHref] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null);
  const [vegaOpen, setVegaOpen] = useState(false);
  const [notes, setNotes] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`scorm-notes-${packageId}`) ?? "";
  });

  const activeSecondsRef = useRef(0);
  const lastActivityRef = useRef(Date.now());

  // Resolve identity
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (userIdProp && studentNameProp) {
        setIdentity({ userId: userIdProp, studentName: studentNameProp });
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("No autenticado"); return; }
      const { data: profile } = await supabase
        .from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      setIdentity({
        userId: user.id,
        studentName: studentNameProp || profile?.full_name || user.email || "Estudiante",
      });
    })();
    return () => { cancelled = true; };
  }, [userIdProp, studentNameProp]);

  // Get courseId from moduleId for chat/glossary integration
  const { data: moduleInfo } = useQuery({
    queryKey: ["scorm-module-info", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules").select("id, title, course_id, courses(id, title)")
        .eq("id", moduleId).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const courseId: string | undefined = moduleInfo?.course_id;
  const moduleTitle: string | undefined = moduleInfo?.title;

  // Load package + attach API
  useEffect(() => {
    if (!identity) return;
    let cancelled = false;
    setError(null);
    setLoading(true);

    (async () => {
      try {
        const prev = await Promise.race([
          loadScormProgress({ userId: identity.userId, enrollmentId, scormPackageId: packageId, moduleId }),
          new Promise<null>(r => setTimeout(() => r(null), 5000)),
        ]);
        if (cancelled) return;

        const key = { userId: identity.userId, enrollmentId, scormPackageId: packageId, moduleId };

        const bridge = attachScormBridge({
          studentId: identity.userId,
          studentName: identity.studentName,
          previousCmi: (prev?.cmi_data as CmiData | null) ?? null,
          previousTotalTime: prev?.total_time ?? null,
          callbacks: {
            onCommit: async (cmi) => {
              try {
                await saveScormProgress(key, cmi);
                queryClient.invalidateQueries({
                  queryKey: ["scorm-progress", moduleId, enrollmentId, identity.userId],
                });
                const loc = cmi["cmi.core.lesson_location"] || cmi["cmi.location"];
                if (loc) setVisited(s => new Set(s).add(loc));
              } catch (e) { console.error("[SCORM] commit failed:", e); }
            },
            onFinish: async (cmi) => {
              try { await saveScormProgress(key, cmi); } catch (e) { console.error(e); }
            },
          },
        });
        bridgeRef.current = bridge;
        cleanupRef.current = bridge.detach;

        const handle = await loadScormPackage({ packageId, filePath });
        if (cancelled) { handle.dispose(); return; }
        handleRef.current = handle;
        setTree(handle.tree);
        setBaseSrc(handle.baseSrc);
        if (handle.courseTitle) setCourseTitle(handle.courseTitle);
        setCurrentHref(handle.launchPath);
        setLoading(false);
      } catch (e: any) {
        console.error("[SCORM Pro] error:", e);
        if (!cancelled) { setError(e?.message || "Error cargando el paquete SCORM"); setLoading(false); }
      }
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      handleRef.current?.dispose();
      handleRef.current = null;
      bridgeRef.current = null;
    };
  }, [identity, packageId, filePath, enrollmentId, moduleId, queryClient]);

  // Active-time heartbeat
  useEffect(() => {
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("click", onActivity);
    const tick = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (document.visibilityState === "visible" && idleMs < 90_000) activeSecondsRef.current += 1;
    }, 1000);
    const commit = window.setInterval(() => {
      const bridge = bridgeRef.current;
      if (!bridge) return;
      try {
        bridge.commitSessionTime(
          secondsToScorm12Time(activeSecondsRef.current),
          secondsToScorm2004Time(activeSecondsRef.current),
        );
      } catch (e) { console.error(e); }
    }, 60_000);
    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("click", onActivity);
      clearInterval(tick); clearInterval(commit);
    };
  }, []);

  const leaves = useMemo(() => flattenLeaves(tree), [tree]);
  const currentIndex = useMemo(() => leaves.findIndex(l => l.href === currentHref), [leaves, currentHref]);

  useEffect(() => { if (currentHref) setVisited(s => new Set(s).add(currentHref)); }, [currentHref]);

  const progress = leaves.length > 0
    ? Math.round((Array.from(visited).filter(h => leaves.some(l => l.href === h)).length / leaves.length) * 100)
    : 0;

  const handlePrev = () => { if (currentIndex > 0) setCurrentHref(leaves[currentIndex - 1].href); };
  const handleNext = () => { if (currentIndex >= 0 && currentIndex < leaves.length - 1) setCurrentHref(leaves[currentIndex + 1].href); };

  const commitNow = () => {
    const b = bridgeRef.current;
    if (!b) return;
    try {
      b.commitSessionTime(
        secondsToScorm12Time(activeSecondsRef.current),
        secondsToScorm2004Time(activeSecondsRef.current),
      );
      toast({ title: "Progreso guardado", description: "Tu avance se ha sincronizado." });
    } catch (e: any) {
      toast({ title: "Error al guardar", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const handleExit = () => {
    try {
      const b = bridgeRef.current;
      if (b) {
        b.commitSessionTime(
          secondsToScorm12Time(activeSecondsRef.current),
          secondsToScorm2004Time(activeSecondsRef.current),
        );
        b.finish();
      }
    } catch (e) { console.error(e); }
    onExit();
  };

  // Persist notes
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(`scorm-notes-${packageId}`, notes); } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [notes, packageId]);

  useResourceTracker({
    resourceType: "scorm",
    resourceId: packageId,
    resourceLabel: packageTitle,
    enrollmentId, moduleId,
  });

  const openTool = (key: ToolKey) => {
    if (key === "print") { window.print(); return; }
    setActiveTool(key);
  };

  const renderTree = (items: ScormTreeItem[], depth = 0) => (
    <ul className={cn("space-y-1", depth === 0 ? "" : "ml-3 mt-1 border-l border-border pl-2")}>
      {items.map((node) => {
        const isCurrent = node.href === currentHref;
        const isVisited = node.href ? visited.has(node.href) : false;
        return (
          <li key={node.id}>
            {node.href ? (
              <button
                type="button"
                onClick={() => { setCurrentHref(node.href!); setActiveTool(null); }}
                className={cn(
                  "w-full text-left rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                  isCurrent && "bg-primary/10 text-primary font-medium",
                  isVisited && !isCurrent && "text-foreground/80"
                )}
              >
                <span className="line-clamp-2">{node.title}</span>
              </button>
            ) : (
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {node.title}
              </div>
            )}
            {node.children.length > 0 && renderTree(node.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  const renderToolContent = () => {
    if (!activeTool) return null;
    const def = TOOLS.find(t => t.key === activeTool)!;
    return (
      <SheetContent side="left" className="w-[360px] sm:w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <span className={cn("h-8 w-8 rounded-full flex items-center justify-center", def.bg)}>
              <def.icon className={cn("h-4 w-4", def.fg)} />
            </span>
            {def.label}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTool === "index" && (
            <ScrollArea className="h-full"><div className="p-3">
              {leaves.length === 0 && !loading
                ? <p className="text-sm text-muted-foreground">Sin índice disponible.</p>
                : renderTree(tree)}
            </div></ScrollArea>
          )}
          {activeTool === "chat" && (
            <div className="h-full p-3 overflow-auto">
              <ModuleChat moduleId={moduleId} courseId={courseId ?? ""} />
            </div>
          )}
          {activeTool === "glossary" && courseId && (
            <ScrollArea className="h-full"><div className="p-3">
              <CourseGlossary courseId={courseId} />
            </div></ScrollArea>
          )}
          {activeTool === "notes" && (
            <div className="h-full p-3 flex flex-col">
              <textarea
                className="flex-1 w-full resize-none rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Toma tus apuntes aquí…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="mt-2 text-xs text-muted-foreground">Se guardan en este dispositivo.</p>
            </div>
          )}
          {activeTool === "grades" && (
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">Consulta tus calificaciones del curso.</p>
              <Button onClick={() => { window.open("/dashboard/student/grades", "_blank"); }}>
                Abrir mis calificaciones
              </Button>
            </div>
          )}
          {(activeTool === "downloads" || activeTool === "evaluations" || activeTool === "tasks"
             || activeTool === "audio" || activeTool === "video" || activeTool === "help") && (
            <div className="p-6 text-center">
              <def.icon className={cn("h-10 w-10 mx-auto mb-3", def.fg)} />
              <p className="text-sm text-muted-foreground">
                {activeTool === "help"
                  ? "Contacta con tu tutor desde el panel del curso."
                  : "Esta herramienta está disponible en la vista del curso. Próximamente integrada aquí."}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header — minimal Vértice style */}
      <header className="flex items-center gap-2 border-b bg-card px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:text-background"
          onClick={handleExit}
          aria-label="Volver al curso"
        >
          <Home className="h-5 w-5" />
        </Button>
        <h1 className="flex-1 text-center text-sm font-bold uppercase tracking-wide truncate sm:text-base">
          {courseTitle}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:text-background"
          onClick={commitNow}
          aria-label="Guardar progreso"
        >
          <Save className="h-5 w-5" />
        </Button>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar de iconos colapsable */}
        <aside
          className={cn(
            "relative bg-card/60 border-r flex flex-col items-center py-3 transition-all duration-200",
            sidebarOpen ? "w-16" : "w-0 overflow-hidden border-r-0"
          )}
        >
          <ScrollArea className="w-full h-full">
            <div className="flex flex-col items-center gap-2 px-2">
              {TOOLS.slice(0, 8).map(t => (
                <ToolIcon key={t.key} def={t} active={activeTool === t.key} onClick={() => openTool(t.key)} />
              ))}
              <div className="my-2 h-px w-8 bg-border" />
              {TOOLS.slice(8).map(t => (
                <ToolIcon key={t.key} def={t} active={activeTool === t.key} onClick={() => openTool(t.key)} />
              ))}
              <button
                type="button"
                aria-label="Más"
                className="mt-1 h-8 w-8 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </ScrollArea>

          {/* Toggle tab */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Ocultar barra"
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-8 w-6 rounded-r-md bg-card border border-l-0 flex items-center justify-center shadow-sm hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </aside>

        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mostrar barra"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-7 rounded-r-md bg-card border border-l-0 flex items-center justify-center shadow-sm hover:bg-muted"
          >
            <ChevronRightTab className="h-4 w-4" />
          </button>
        )}

        {/* Viewport */}
        <main className="flex-1 flex flex-col min-w-0 bg-muted/30">
          <div className="flex-1 relative">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                  <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive" />
                  <p className="font-medium mb-1">No se pudo cargar el SCORM</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button className="mt-4" variant="outline" onClick={onExit}>Volver</Button>
                </div>
              </div>
            ) : loading || !currentHref || !baseSrc ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Cargando contenido…</span>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                key={currentHref}
                src={`${baseSrc}${currentHref}`}
                title={courseTitle}
                className="absolute inset-0 w-full h-full bg-white"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                allow="autoplay; fullscreen; microphone; camera"
              />
            )}
          </div>

          {/* Pagination + progress (Vértice style) */}
          <div className="border-t bg-card">
            <div className="flex items-center justify-center gap-3 py-2 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                aria-label="Anterior"
                className="h-8 w-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                Página{" "}
                <span className="inline-flex items-center justify-center min-w-[2rem] px-2 h-6 border rounded text-foreground font-medium">
                  {Math.max(currentIndex + 1, 1)}
                </span>{" "}
                de {leaves.length || 1}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex < 0 || currentIndex >= leaves.length - 1}
                aria-label="Siguiente"
                className="h-8 w-8 rounded-full border flex items-center justify-center disabled:opacity-40 hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative h-2 w-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
                aria-label={`Progreso ${progress}%`}
              />
              <span className="absolute left-2 -top-5 text-[11px] text-muted-foreground">
                Progreso: {progress}%
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI assistant button */}
      <button
        type="button"
        onClick={() => setVegaOpen(v => !v)}
        aria-label="Abrir asistente"
        className={cn(
          "fixed bottom-4 right-4 z-[55] h-14 w-14 rounded-full shadow-xl",
          "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground",
          "flex items-center justify-center hover:scale-105 transition-transform",
          vegaOpen && "hidden"
        )}
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
      </button>

      <VegaAssistant
        open={vegaOpen}
        onClose={() => setVegaOpen(false)}
        courseTitle={courseTitle}
        moduleTitle={moduleTitle}
        lessonTitle={leaves[currentIndex]?.title}
      />

      {/* Tool sheet */}
      <Sheet open={!!activeTool} onOpenChange={(o) => !o && setActiveTool(null)}>
        {renderToolContent()}
      </Sheet>
    </div>
  );
}

function ToolIcon({ def, active, onClick }: { def: ToolDef; active: boolean; onClick: () => void }) {
  const Icon = def.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      title={def.label}
      aria-label={def.label}
      className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center transition-all",
        def.bg,
        active ? "ring-2 ring-primary scale-105" : "hover:scale-105"
      )}
    >
      <Icon className={cn("h-5 w-5", def.fg)} />
    </button>
  );
}
