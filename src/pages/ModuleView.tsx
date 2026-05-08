import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useContentTracker } from "@/hooks/useContentTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, BookOpen, Lightbulb, FileText, MessageSquare, Menu, ListChecks } from "lucide-react";
import ScormPlayer from "@/components/scorm/ScormPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleChat } from "@/components/ModuleChat";
import { InteractiveContent } from "@/components/InteractiveContent";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ModuleProgressBar from "@/components/courses/ModuleProgressBar";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  order_index: number;
  duration_minutes: number;
}

interface ModuleProgress {
  id: string;
  completed: boolean;
}

export default function ModuleView() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Track content interaction for SEPE compliance
  const { markAsCompleted } = useContentTracker({
    moduleId: moduleId || '',
    enrollmentId: enrollmentId || '',
    enabled: !!moduleId && !!enrollmentId,
  });

  useEffect(() => {
    if (courseId && moduleId && user) {
      loadModuleData();
    }
  }, [courseId, moduleId, user]);

  const loadModuleData = async () => {
    try {
      // Load current module
      const { data: moduleData, error: moduleError } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      if (moduleError) throw moduleError;
      setModule(moduleData);

      // Load all modules for navigation
      const { data: modulesData } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      setAllModules(modulesData || []);

      // Load progress
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user!.id)
        .single();

      if (enrollmentData) {
        setEnrollmentId(enrollmentData.id);
        
        const { data: progressData } = await supabase
          .from("module_progress")
          .select("*")
          .eq("enrollment_id", enrollmentData.id)
          .eq("module_id", moduleId)
          .maybeSingle();

        setProgress(progressData);
      }
    } catch (error: any) {
      console.error("Error loading module:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    try {
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("user_id", user!.id)
        .single();

      if (!enrollmentData) throw new Error("Enrollment not found");

      if (progress) {
        await supabase
          .from("module_progress")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("id", progress.id);
      } else {
        await supabase.from("module_progress").insert({
          enrollment_id: enrollmentData.id,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }

      // Track completion for SEPE compliance
      await markAsCompleted();

      toast({
        title: "¡Módulo completado!",
        description: "Has marcado este módulo como completado",
      });

      loadModuleData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const navigateToModule = (direction: "prev" | "next") => {
    if (!module || allModules.length === 0) return;

    const currentIndex = allModules.findIndex((m) => m.id === moduleId);
    const targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < allModules.length) {
      navigate(`/course/${courseId}/module/${allModules[targetIndex].id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Módulo no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(`/course/${courseId}`)}>
              Volver al curso
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = allModules.findIndex((m) => m.id === moduleId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allModules.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/course/${courseId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al curso
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">
                  Módulo {module.order_index}
                </div>
                <CardTitle className="text-3xl mb-2">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </div>
              {progress?.completed && (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger value="interactive" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Interactivo
                </TabsTrigger>
                <TabsTrigger value="activities" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Actividades
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 mt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(module.content || "", {
                        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel']
                      }) 
                    }}
                  />
                </div>

                {/* SCORM Content */}
                {enrollmentId && (
                  <div className="pt-6 border-t">
                    <ScormPlayer moduleId={moduleId!} enrollmentId={enrollmentId} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="interactive" className="mt-6">
                <InteractiveContent moduleId={moduleId!} />
              </TabsContent>

              <TabsContent value="activities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Actividades del Módulo</CardTitle>
                    <CardDescription>
                      Completa las actividades para reforzar tu aprendizaje
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay actividades asignadas para este módulo</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <ModuleChat moduleId={moduleId!} courseId={courseId!} />
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigateToModule("prev")}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Módulo anterior
              </Button>

              {!progress?.completed && (
                <Button onClick={markAsComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como completado
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => navigateToModule("next")}
                disabled={!hasNext}
              >
                Siguiente módulo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
