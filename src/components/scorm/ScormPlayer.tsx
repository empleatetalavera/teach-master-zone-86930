import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScormPlayerProps {
  moduleId: string;
  enrollmentId: string;
}

export default function ScormPlayer({ moduleId, enrollmentId }: ScormPlayerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("not attempted");

  // Fetch SCORM content for this module
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
    }
  });

  // Fetch user's SCORM progress
  const { data: userProgress } = useQuery({
    queryKey: ["scorm-progress", moduleId, enrollmentId],
    queryFn: async () => {
      if (!scormContent || scormContent.length === 0) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const packageIds = scormContent.map((sc: any) => sc.scorm_packages.id);
      
      const { data, error } = await supabase
        .from("scorm_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("enrollment_id", enrollmentId)
        .in("scorm_package_id", packageIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!scormContent && scormContent.length > 0
  });

  // Save SCORM progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async ({ 
      packageId, 
      cmiData, 
      lessonStatus 
    }: { 
      packageId: string; 
      cmiData: any; 
      lessonStatus: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("scorm_progress")
        .upsert({
          user_id: user.id,
          enrollment_id: enrollmentId,
          scorm_package_id: packageId,
          module_id: moduleId,
          cmi_data: cmiData,
          lesson_status: lessonStatus,
          last_accessed_at: new Date().toISOString()
        }, {
          onConflict: "user_id,scorm_package_id,enrollment_id"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scorm-progress", moduleId, enrollmentId] });
    }
  });

  const handlePlay = (scormPackage: any) => {
    setIsPlaying(true);
    // Here you would implement the SCORM player logic
    // For now, we'll show a simple message
    toast({
      title: "Reproduciendo SCORM",
      description: `Iniciando: ${scormPackage.title}`,
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setStatus("not attempted");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "incomplete":
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      "completed": { label: "Completado", variant: "default" },
      "passed": { label: "Aprobado", variant: "default" },
      "failed": { label: "No aprobado", variant: "destructive" },
      "incomplete": { label: "En progreso", variant: "secondary" },
      "not attempted": { label: "No iniciado", variant: "outline" }
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
        const packageProgress = userProgress?.find((p: any) => p.scorm_package_id === scormPackage.id);
        const currentStatus = packageProgress?.lesson_status || "not attempted";
        const currentProgress = packageProgress?.score_raw || 0;

        return (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(currentStatus)}
                    {scormPackage.title}
                  </CardTitle>
                  <CardDescription>
                    {scormPackage.description}
                  </CardDescription>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(currentStatus)}
                    <Badge variant="outline">SCORM {scormPackage.scorm_version}</Badge>
                    {content.is_required && (
                      <Badge variant="secondary">Obligatorio</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              {currentProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{currentProgress}%</span>
                  </div>
                  <Progress value={currentProgress} />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePlay(scormPackage)}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {currentStatus === "not attempted" ? "Iniciar" : "Continuar"}
                </Button>
                {currentStatus !== "not attempted" && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                )}
              </div>

              {/* Last accessed */}
              {packageProgress?.last_accessed_at && (
                <p className="text-xs text-muted-foreground">
                  Último acceso: {new Date(packageProgress.last_accessed_at).toLocaleString("es-ES")}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* SCORM Player Frame (hidden by default) */}
      {isPlaying && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                title="SCORM Player"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}