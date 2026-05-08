/**
 * Professional SCORM Player — full-screen wrapper compatible with SEPE/FUNDAE.
 *
 * Layout:
 *  - Header: course title, % progress, exit button.
 *  - Sidebar (collapsible, hidden on mobile by default): hierarchical lesson
 *    tree with status icons (pending / current / completed).
 *  - Center viewport: same-origin iframe served by the SCORM service worker.
 *  - Bottom nav: Previous / Next across leaf lessons.
 *
 * Active-time tracking: the player counts seconds while the document is
 * visible AND the user has interacted recently, then commits cmi.core.session_time
 * back to the LMS every 60s (LMSCommit -> backend persistence).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { CmiData } from "@/lib/scorm/scorm12-api";
import {
  attachScormBridge,
  secondsToScorm12Time,
  secondsToScorm2004Time,
  type ScormBridgeHandle,
} from "@/lib/scorm/scorm-again-bridge";
import {
  loadScormProgress,
  saveScormProgress,
} from "@/lib/scorm/scorm-persistence";
import {
  loadScormPackage,
  type ScormRuntimeHandle,
  type ScormTreeItem,
} from "@/lib/scorm/scorm-runtime";
import { useResourceTracker } from "@/hooks/useResourceTracker";

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

type FlatLeaf = {
  id: string;
  title: string;
  href: string;
  /** Index path for breadcrumbs / status. */
  depth: number;
};

function flattenLeaves(tree: ScormTreeItem[], depth = 0, out: FlatLeaf[] = []): FlatLeaf[] {
  for (const node of tree) {
    if (node.href) out.push({ id: node.id, title: node.title, href: node.href, depth });
    if (node.children.length) flattenLeaves(node.children, depth + 1, out);
  }
  return out;
}

function secondsToScormTime(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(4, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.00`;
}

export default function ScormProPlayer({
  packageId,
  filePath,
  packageTitle,
  enrollmentId,
  moduleId,
  onExit,
  userId: userIdProp,
  studentName: studentNameProp,
}: Props) {
  const queryClient = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const handleRef = useRef<ScormRuntimeHandle | null>(null);
  const bridgeRef = useRef<ScormBridgeHandle | null>(null);

  const [identity, setIdentity] = useState<{ userId: string; studentName: string } | null>(null);
  const [tree, setTree] = useState<ScormTreeItem[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>(packageTitle);
  const [baseSrc, setBaseSrc] = useState<string>("");
  const [currentHref, setCurrentHref] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);

  // Active-time tracking
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

  // Load package + attach API
  useEffect(() => {
    if (!identity) return;
    let cancelled = false;
    setError(null);
    setLoading(true);

    (async () => {
      try {
        const prev = await Promise.race([
          loadScormProgress({
            userId: identity.userId,
            enrollmentId,
            scormPackageId: packageId,
            moduleId,
          }),
          new Promise<null>((r) => setTimeout(() => r(null), 5000)),
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
                if (loc) setVisited((s) => new Set(s).add(loc));
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
        if (!cancelled) {
          setError(e?.message || "Error cargando el paquete SCORM");
          setLoading(false);
        }
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

  // Active-time heartbeat — commit every 60s
  useEffect(() => {
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("click", onActivity);

    const tick = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (document.visibilityState === "visible" && idleMs < 90_000) {
        activeSecondsRef.current += 1;
      }
    }, 1000);

    const commit = window.setInterval(() => {
      const bridge = bridgeRef.current;
      if (!bridge) return;
      try {
        bridge.commitSessionTime(
          secondsToScorm12Time(activeSecondsRef.current),
          secondsToScorm2004Time(activeSecondsRef.current),
        );
      } catch (e) { console.error("[SCORM] heartbeat commit error:", e); }
    }, 60_000);

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("click", onActivity);
      clearInterval(tick);
      clearInterval(commit);
    };
  }, []);

  const leaves = useMemo(() => flattenLeaves(tree), [tree]);
  const currentIndex = useMemo(
    () => leaves.findIndex((l) => l.href === currentHref),
    [leaves, currentHref]
  );

  // Track visited
  useEffect(() => {
    if (currentHref) setVisited((s) => new Set(s).add(currentHref));
  }, [currentHref]);

  const progress = leaves.length > 0
    ? Math.round((Array.from(visited).filter((h) => leaves.some((l) => l.href === h)).length / leaves.length) * 100)
    : 0;

  const handleNavigate = (href: string) => setCurrentHref(href);
  const handlePrev = () => { if (currentIndex > 0) setCurrentHref(leaves[currentIndex - 1].href); };
  const handleNext = () => { if (currentIndex >= 0 && currentIndex < leaves.length - 1) setCurrentHref(leaves[currentIndex + 1].href); };

  const handleExit = () => {
    try {
      const api = apiRef.current;
      if (api) {
        api.LMSSetValue("cmi.core.session_time", secondsToScormTime(activeSecondsRef.current));
        api.LMSSetValue("cmi.core.exit", "suspend");
        api.LMSFinish("");
      }
    } catch (e) { console.error(e); }
    onExit();
  };

  const renderTree = (items: ScormTreeItem[], depth = 0) => (
    <ul className={cn("space-y-1", depth === 0 ? "" : "ml-4 mt-1 border-l border-border pl-2")}>
      {items.map((node) => {
        const isCurrent = node.href === currentHref;
        const isVisited = node.href ? visited.has(node.href) : false;
        const Icon = isCurrent ? PlayCircle : isVisited ? CheckCircle2 : Circle;
        return (
          <li key={node.id}>
            {node.href ? (
              <button
                type="button"
                onClick={() => handleNavigate(node.href!)}
                className={cn(
                  "w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  "hover:bg-muted",
                  isCurrent && "bg-primary/10 text-primary font-medium"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  isCurrent ? "text-primary" : isVisited ? "text-green-600" : "text-muted-foreground"
                )} />
                <span className="line-clamp-2">{node.title}</span>
              </button>
            ) : (
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {node.title}
              </div>
            )}
            {node.children.length > 0 && renderTree(node.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b bg-card px-3 py-2 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Ocultar índice" : "Mostrar índice"}
        >
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-sm font-semibold sm:text-base">{courseTitle}</h1>
          <div className="hidden sm:flex items-center gap-2 mt-1">
            <Progress value={progress} className="h-1.5 w-40" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground">
          <span>Lección {Math.max(currentIndex + 1, 0)} / {leaves.length || 1}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleExit}>
          <X className="h-4 w-4 mr-1" /> Salir
        </Button>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className={cn(
            "border-r bg-card",
            "w-72 shrink-0",
            "absolute inset-y-0 left-0 top-[57px] z-10 md:static md:top-auto",
            "shadow-lg md:shadow-none"
          )}>
            <ScrollArea className="h-full">
              <div className="p-3">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Índice de contenidos
                </p>
                {leaves.length === 0 && !loading ? (
                  <p className="text-sm text-muted-foreground">Sin índice disponible.</p>
                ) : (
                  renderTree(tree)
                )}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Viewport */}
        <main className="flex-1 flex flex-col bg-muted/30 min-w-0">
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
              />
            )}
          </div>

          {/* Bottom nav */}
          {leaves.length > 1 && (
            <nav className="flex items-center justify-between gap-2 border-t bg-card px-3 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[50%]">
                {leaves[currentIndex]?.title}
              </span>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={currentIndex < 0 || currentIndex >= leaves.length - 1}
              >
                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
