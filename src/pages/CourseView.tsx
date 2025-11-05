import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Clock, BarChart3, ArrowLeft, Calendar, MessageSquare, FileText, CheckCircle2, PlayCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_hours: number;
  thumbnail_url: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  completed?: boolean;
  progress?: number;
  evaluations?: any[];
  activities?: any[];
  scorm_content?: any[];
}

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [forumTopics, setForumTopics] = useState<any[]>([]);

  useEffect(() => {
    if (courseId && user) {
      loadCourseData();
    }
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (modulesError) throw modulesError;

      // Load progress for each module
      const modulesWithProgress = await Promise.all(
        modulesData.map(async (module) => {
          const [evaluations, activities, scormContent, progress] = await Promise.all([
            supabase.from("evaluations").select("*").eq("module_id", module.id),
            supabase.from("development_activities").select("*").eq("module_id", module.id),
            supabase.from("module_scorm_content").select("*, scorm_packages(*)").eq("module_id", module.id),
            supabase.from("module_progress").select("*").eq("module_id", module.id).eq("enrollment_id", user!.id).maybeSingle()
          ]);

          return {
            ...module,
            evaluations: evaluations.data || [],
            activities: activities.data || [],
            scorm_content: scormContent.data || [],
            completed: progress.data?.completed || false,
            progress: progress.data?.completed ? 100 : 0
          };
        })
      );

      setModules(modulesWithProgress);

      // Load or create enrollment
      let { data: enrollmentData, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (enrollmentError && enrollmentError.code !== "PGRST116") throw enrollmentError;

      if (!enrollmentData) {
        // Create enrollment
        const { data: newEnrollment, error: createError } = await supabase
          .from("enrollments")
          .insert({
            user_id: user!.id,
            course_id: courseId,
          })
          .select()
          .single();

        if (createError) throw createError;
        enrollmentData = newEnrollment;
      }

      setEnrollment(enrollmentData);

      // Load calendar events
      const { data: eventsData } = await supabase
        .from("course_events")
        .select("*")
        .eq("course_id", courseId)
        .gte("start_time", new Date().toISOString())
        .order("start_time")
        .limit(5);

      setEvents(eventsData || []);

      // Load forum topics
      const { data: topicsData } = await supabase
        .from("forum_topics")
        .select("*, profiles(full_name)")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .limit(10);

      setForumTopics(topicsData || []);
    } catch (error: any) {
      console.error("Error loading course:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500";
      case "intermediate":
        return "bg-yellow-500";
      case "advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Curso no encontrado</CardTitle>
            <CardDescription>
              El curso que buscas no existe o no está disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {/* Course Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getLevelColor(course.level)}>
                    {getLevelLabel(course.level)}
                  </Badge>
                  {course.category && (
                    <Badge variant="outline">{course.category}</Badge>
                  )}
                </div>
                <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                <CardDescription className="text-base">
                  {course.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{course.duration_hours} horas</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{modules.length} módulos</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>{enrollment?.progress_percentage || 0}% completado</span>
              </div>
            </div>
            {enrollment && (
              <div className="mt-4">
                <Progress value={enrollment.progress_percentage || 0} />
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Course Content Tabs */}
        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules">
              <BookOpen className="h-4 w-4 mr-2" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="forum">
              <MessageSquare className="h-4 w-4 mr-2" />
              Foro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            <h2 className="text-2xl font-bold">Módulos del curso</h2>
            <Accordion type="multiple" className="space-y-4">
              {modules.map((module, index) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg">
                  <Card>
                    <AccordionTrigger className="hover:no-underline px-6">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Progress value={module.progress || 0} className="w-24" />
                            <span className="text-sm font-medium">{module.progress || 0}%</span>
                          </div>
                          {module.completed && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{module.duration_minutes} min</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="space-y-4 pt-4">
                        {/* Module Content */}
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate(`/course/${courseId}/module/${module.id}`)}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Ver contenido del módulo
                        </Button>

                        {/* Evaluations */}
                        {module.evaluations && module.evaluations.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Evaluaciones ({module.evaluations.length})
                            </h4>
                            {module.evaluations.map((evaluation: any) => (
                              <Button
                                key={evaluation.id}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                              >
                                {evaluation.title}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Development Activities */}
                        {module.activities && module.activities.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Actividades ({module.activities.length})
                            </h4>
                            {module.activities.map((activity: any) => (
                              <Button
                                key={activity.id}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                              >
                                {activity.title}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* SCORM Content */}
                        {module.scorm_content && module.scorm_content.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <PlayCircle className="h-4 w-4" />
                              Contenido SCORM ({module.scorm_content.length})
                            </h4>
                            {module.scorm_content.map((scorm: any) => (
                              <Button
                                key={scorm.id}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                              >
                                {scorm.scorm_packages?.title || "Paquete SCORM"}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Próximos eventos</CardTitle>
                <CardDescription>Fechas importantes del curso</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay eventos próximos</p>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card key={event.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.start_time).toLocaleString('es-ES')}</span>
                            </div>
                          </div>
                          <Badge>{event.event_type}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forum" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Foro de discusión</CardTitle>
                    <CardDescription>Participa en las conversaciones del curso</CardDescription>
                  </div>
                  <Button>Nuevo tema</Button>
                </div>
              </CardHeader>
              <CardContent>
                {forumTopics.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay temas en el foro</p>
                ) : (
                  <div className="space-y-4">
                    {forumTopics.map((topic) => (
                      <Card key={topic.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{topic.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Por: {topic.profiles?.full_name || "Usuario"}</span>
                              <span>{new Date(topic.created_at).toLocaleDateString('es-ES')}</span>
                              <span>{topic.views_count} vistas</span>
                            </div>
                          </div>
                          {topic.is_pinned && <Badge variant="secondary">Fijado</Badge>}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
