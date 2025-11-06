import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Video, FileText, MessageSquare, Clock, PlayCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress_percentage: number;
  last_accessed_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    duration_hours: number;
    video_url: string;
  };
  modules?: Module[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  is_completed?: boolean;
  progress?: number;
}

const StudentClassroom = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get enrolled courses with course details
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select(`
          *,
          course:courses (
            id,
            title,
            description,
            thumbnail_url,
            duration_hours,
            video_url
          )
        `)
        .eq("user_id", userData.user.id)
        .order("last_accessed_at", { ascending: false });

      if (enrollError) throw enrollError;

      // Load modules for each course
      const coursesWithModules = await Promise.all(
        (enrollments || []).map(async (enrollment) => {
          const { data: modules, error: modulesError } = await supabase
            .from("modules")
            .select("*")
            .eq("course_id", enrollment.course_id)
            .eq("is_active", true)
            .order("order_index");

          if (modulesError) throw modulesError;

          // Get progress for each module
          const modulesWithProgress = await Promise.all(
            (modules || []).map(async (module) => {
              const { data: progress } = await supabase
                .from("module_progress")
                .select("completed, time_spent_minutes")
                .eq("enrollment_id", enrollment.id)
                .eq("module_id", module.id)
                .single();

              return {
                ...module,
                is_completed: progress?.completed || false,
                progress: progress?.time_spent_minutes || 0,
              };
            })
          );

          return {
            ...enrollment,
            modules: modulesWithProgress,
          };
        })
      );

      setEnrolledCourses(coursesWithModules);
      if (coursesWithModules.length > 0) {
        setSelectedCourse(coursesWithModules[0]);
      }
    } catch (error: any) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccessModule = (moduleId: string) => {
    if (selectedCourse) {
      navigate(`/course/${selectedCourse.course_id}/module/${moduleId}`);
    }
  };

  const handleAccessCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">No estás matriculado en ningún curso</h2>
        <p className="text-muted-foreground">Contacta con tu administrador para inscribirte en un curso</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Video className="h-8 w-8" />
          Aula Virtual
        </h1>
        <p className="text-muted-foreground mt-2">
          Accede a tus cursos, módulos y recursos de aprendizaje
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course List Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Mis Cursos Activos</CardTitle>
            <CardDescription>Selecciona un curso para ver sus módulos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrolledCourses.map((enrollment) => (
              <div
                key={enrollment.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedCourse?.id === enrollment.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedCourse(enrollment)}
              >
                <h3 className="font-semibold mb-2">{enrollment.course.title}</h3>
                <Progress value={enrollment.progress_percentage} className="mb-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{enrollment.progress_percentage}% completado</span>
                  <Badge variant="secondary">
                    {enrollment.modules?.length || 0} módulos
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Course Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCourse && (
            <>
              {/* Course Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {selectedCourse.course.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {selectedCourse.course.description}
                      </CardDescription>
                    </div>
                    <Button onClick={() => handleAccessCourse(selectedCourse.course_id)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver Curso Completo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {selectedCourse.course.duration_hours}h de duración
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {selectedCourse.modules?.length || 0} módulos
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {selectedCourse.progress_percentage}% completado
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Tabs */}
              <Tabs defaultValue="modules" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="modules">Módulos</TabsTrigger>
                  <TabsTrigger value="resources">Recursos</TabsTrigger>
                  <TabsTrigger value="communication">Comunicación</TabsTrigger>
                </TabsList>

                <TabsContent value="modules" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Módulos del Curso</CardTitle>
                      <CardDescription>
                        Accede a cada módulo para continuar tu aprendizaje
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                        selectedCourse.modules.map((module, index) => (
                          <div
                            key={module.id}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleAccessModule(module.id)}
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                {module.is_completed ? (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <span className="text-sm font-semibold text-primary">
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{module.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {module.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {module.duration_minutes} min
                                  </span>
                                  {module.is_completed && (
                                    <Badge variant="default" className="text-xs">
                                      Completado
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <PlayCircle className="h-5 w-5" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay módulos disponibles
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recursos de Aprendizaje</CardTitle>
                      <CardDescription>
                        Material complementario y recursos adicionales
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedCourse.course.video_url && (
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-semibold">Video de Presentación</h4>
                              <p className="text-sm text-muted-foreground">
                                Introducción al curso
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => window.open(selectedCourse.course.video_url, "_blank")}
                          >
                            Ver Video
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-semibold">Materiales del Curso</h4>
                            <p className="text-sm text-muted-foreground">
                              Documentos y presentaciones
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">Ver Archivos</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-semibold">Bibliografía Recomendada</h4>
                            <p className="text-sm text-muted-foreground">
                              Lecturas complementarias
                            </p>
                          </div>
                        </div>
                        <Button variant="outline">Ver Lista</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="communication" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Comunicación con el Docente</CardTitle>
                      <CardDescription>
                        Envía mensajes y consultas a tu profesor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => navigate("/dashboard/student/messages")}
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Enviar Mensaje al Docente
                      </Button>

                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={() => navigate("/dashboard/student/support")}
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Centro de Ayuda
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentClassroom;
