import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  createScorm12API,
  attachScorm12ToWindow,
  type CmiData,
} from "@/lib/scorm/scorm12-api";
import {
  loadScormProgress,
  saveScormProgress,
} from "@/lib/scorm/scorm-persistence";
import {
  loadScormPackage,
  type ScormRuntimeHandle,
} from "@/lib/scorm/scorm-runtime";

interface ScormPlayerProps {
  moduleId: string;
  enrollmentId: string;
  /** Optional: if not provided, resolved from supabase.auth */
  userId?: string;
  /** Optional: if not provided, resolved from profiles.full_name */
  studentName?: string;
}

type ActivePackage = {
  id: string;
  title: string;
  filePath: string;
  scormVersion: string;
};

export default function ScormPlayer({
  moduleId,
  enrollmentId,
  userId: userIdProp,
  studentName: studentNameProp,
}: ScormPlayerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const [activePackage, setActivePackage] = useState<ActivePackage | null>(null);
  const [apiReady, setApiReady] = useState(false);

  // Resolve identity if not passed by parent
  const { data: identity } = useQuery({
    queryKey: ["scorm-identity", userIdProp],
    queryFn: async () => {
      if (userIdProp && studentNameProp) {
        return { userId: userIdProp, studentName: studentNameProp };
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      return {
        userId: user.id,
        studentName: studentNameProp || profile?.full_name || user.email || "Student",
      };
    },
  });

  // SCORM packages bound to this module
  const { data: scormContent, isLoading } = useQuery({
    queryKey: ["module-scorm", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_scorm_content")
        .select(`
          *,
          scorm_packages (
            id,
            title,
            description,
            file_path,
            scorm_version
          )
        `)
        .eq("module_id", moduleId)
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  // User progress for these packages
  const { data: userProgress } = useQuery({
    queryKey: ["scorm-progress", moduleId, enrollmentId, identity?.userId],
    queryFn: async () => {
      if (!scormContent || scormContent.length === 0 || !identity) return [];
      const packageIds = scormContent
        .map((sc: any) => sc.scorm_packages?.id)
        .filter(Boolean);
      const { data, error } = await supabase
        .from("scorm_progress")
        .select("*")
        .eq("user_id", identity.userId)
        .eq("enrollment_id", enrollmentId)
        .in("scorm_package_id", packageIds);
      if (error) throw error;
      return data;
    },
    enabled: !!scormContent && scormContent.length > 0 && !!identity,
  });

  // Mount/unmount window.API around the active package
  useEffect(() => {
    if (!activePackage || !identity) return;

    let cancelled = false;

    (async () => {
      const prev = await loadScormProgress({
        userId: identity.userId,
        enrollmentId,
        scormPackageId: activePackage.id,
        moduleId,
      });
      if (cancelled) return;

      const key = {
        userId: identity.userId,
        enrollmentId,
        scormPackageId: activePackage.id,
        moduleId,
      };

      const api = createScorm12API({
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
            } catch (e) {
              console.error("[SCORM] commit failed:", e);
            }
          },
          onFinish: async (cmi) => {
            try {
              await saveScormProgress(key, cmi);
              queryClient.invalidateQueries({
                queryKey: ["scorm-progress", moduleId, enrollmentId, identity.userId],
              });
            } catch (e) {
              console.error("[SCORM] finish failed:", e);
            }
          },
        },
      });

      const cleanup = attachScorm12ToWindow(api);
      cleanupRef.current = cleanup;
      setApiReady(true);
    })();

    return () => {
      cancelled = true;
      setApiReady(false);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [activePackage, identity, enrollmentId, moduleId, queryClient]);

  const handlePlay = (scormPackage: any) => {
    setActivePackage({
      id: scormPackage.id,
      title: scormPackage.title,
      filePath: scormPackage.file_path,
      scormVersion: scormPackage.scorm_version,
    });
  };

  const handleClose = () => {
    setActivePackage(null);
  };

  const handleReset = async (packageId: string) => {
    if (!identity) return;
    if (!confirm("¿Reiniciar el progreso de este SCORM?")) return;
    const { error } = await supabase
      .from("scorm_progress")
      .delete()
      .eq("user_id", identity.userId)
      .eq("enrollment_id", enrollmentId)
      .eq("scorm_package_id", packageId)
      .eq("module_id", moduleId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({
      queryKey: ["scorm-progress", moduleId, enrollmentId, identity.userId],
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "incomplete":
        return <Loader2 className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      completed: { label: "Completado", variant: "default" },
      passed: { label: "Aprobado", variant: "default" },
      failed: { label: "No aprobado", variant: "destructive" },
      incomplete: { label: "En progreso", variant: "secondary" },
      "not attempted": { label: "No iniciado", variant: "outline" },
    };
    const config = variants[status] || variants["not attempted"];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando contenido SCORM...</p>
        </CardContent>
      </Card>
    );
  }

  if (!scormContent || scormContent.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No hay contenido SCORM disponible para este módulo</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scormContent.map((content: any) => {
        const scormPackage = content.scorm_packages;
        if (!scormPackage) return null;
        const packageProgress = userProgress?.find((p: any) => p.scorm_package_id === scormPackage.id);
        const currentStatus = packageProgress?.lesson_status || "not attempted";
        const currentScore = packageProgress?.score_raw || 0;
        const isActive = activePackage?.id === scormPackage.id;

        return (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(currentStatus)}
                    {scormPackage.title}
                  </CardTitle>
                  <CardDescription>{scormPackage.description}</CardDescription>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(currentStatus)}
                    <Badge variant="outline">SCORM {scormPackage.scorm_version}</Badge>
                    {content.is_required && <Badge variant="secondary">Obligatorio</Badge>}
                    {currentScore > 0 && (
                      <Badge variant="outline">Nota: {currentScore}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentScore > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Puntuación</span>
                    <span className="font-medium">{currentScore}%</span>
                  </div>
                  <Progress value={currentScore} />
                </div>
              )}

              <div className="flex gap-2">
                {isActive ? (
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    <X className="mr-2 h-4 w-4" />
                    Cerrar reproductor
                  </Button>
                ) : (
                  <Button onClick={() => handlePlay(scormPackage)} className="flex-1">
                    <Play className="mr-2 h-4 w-4" />
                    {currentStatus === "not attempted" ? "Iniciar" : "Continuar"}
                  </Button>
                )}
                {currentStatus !== "not attempted" && (
                  <Button variant="outline" onClick={() => handleReset(scormPackage.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                )}
              </div>

              {/* Inline player — only renders once API is attached to window */}
              {isActive && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden border">
                  {apiReady ? (
                    <iframe
                      ref={iframeRef}
                      src={buildScoSrc(activePackage!.filePath)}
                      className="w-full h-full"
                      title={`SCORM: ${activePackage!.title}`}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Inicializando SCORM…
                    </div>
                  )}
                </div>
              )}

              {packageProgress?.last_accessed_at && (
                <p className="text-xs text-muted-foreground">
                  Último acceso: {new Date(packageProgress.last_accessed_at).toLocaleString("es-ES")}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
