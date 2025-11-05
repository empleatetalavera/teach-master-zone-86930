import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Clock, BarChart3, ArrowLeft, Calendar, MessageSquare, FileText, CheckCircle2, PlayCircle, ChevronDown, Mail, Phone, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TutorMessaging } from "@/components/TutorMessaging";
import { GradesSection } from "@/components/GradesSection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeTrackingReport } from "@/components/TimeTrackingReport";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_hours: number;
  thumbnail_url: string;
  video_url?: string;
  objectives?: string;
  specific_objectives?: string[];
  concept_map_url?: string;
  support_email?: string;
  support_phone?: string;
  tutor_id?: string;
  tutor_cv_url?: string;
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
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [studentName, setStudentName] = useState<string>("");

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
      
      // Parse specific_objectives if it's a JSON field
      const parsedCourse = {
        ...courseData,
        specific_objectives: Array.isArray(courseData.specific_objectives) 
          ? courseData.specific_objectives 
          : []
      };
      setCourse(parsedCourse as Course);

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

      // Load tutorials (events of type 'tutorial')
      const { data: tutorialsData } = await supabase
        .from("course_events")
        .select("*")
        .eq("course_id", courseId)
        .eq("event_type", "tutorial")
        .order("start_time", { ascending: true });

      setTutorials(tutorialsData || []);

      // Load exams (evaluations)
      const { data: examsData } = await supabase
        .from("evaluations")
        .select(`
          *,
          evaluation_attempts (
            id,
            score,
            status,
            completed_at
          )
        `)
        .eq("course_id", courseId)
        .eq("is_active", true);

      setExams(examsData || []);

      // Load student name from profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .single();
      
      if (profileData) {
        setStudentName(profileData.full_name || "Usuario");
      }
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
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <img 
                    src="/branding/sepe-logo.png" 
                    alt="SEPE" 
                    className="h-8 object-contain"
                  />
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
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground flex-wrap">
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
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a 
                    href="https://wa.me/34665673416?text=Hola,%20tengo%20una%20duda%20sobre%20el%20curso" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp Dudas
                  </a>
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Contacto
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] max-h-[600px] overflow-auto" align="end">
                    <TutorMessaging 
                      courseId={courseId!}
                      tutorId={course.tutor_id}
                      supportEmail={course.support_email}
                      supportPhone={course.support_phone}
                    />
                  </PopoverContent>
                </Popover>
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
        <Tabs defaultValue="intro" className="space-y-4">
          <div className="flex gap-4">
            <TabsList className="flex flex-col h-fit w-48 sticky top-4">
              <TabsTrigger value="intro" className="w-full justify-start">Inicio</TabsTrigger>
              <TabsTrigger value="modules" className="w-full justify-start">Módulos</TabsTrigger>
              <TabsTrigger value="grades" className="w-full justify-start">Calificaciones</TabsTrigger>
              <TabsTrigger value="exams" className="w-full justify-start">Exámenes</TabsTrigger>
              <TabsTrigger value="tutorials" className="w-full justify-start">Tutorías</TabsTrigger>
              <TabsTrigger value="calendar" className="w-full justify-start">Calendario</TabsTrigger>
              <TabsTrigger value="forum" className="w-full justify-start">Foro</TabsTrigger>
              <TabsTrigger value="time-tracking" className="w-full justify-start">Tiempos Invertidos</TabsTrigger>
            </TabsList>
            
            <div className="flex-1">

          <TabsContent value="intro" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guía de Uso de la Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold">Bienvenido/a al Campus Virtual</h3>
                  <p className="text-muted-foreground">
                    Esta plataforma está diseñada para facilitar tu proceso de aprendizaje. A continuación, 
                    te explicamos cómo navegar por las diferentes secciones:
                  </p>
                  <ul className="space-y-2 mt-4 list-disc list-inside">
                    <li><strong>Módulos:</strong> Accede al contenido del curso organizado por unidades didácticas</li>
                    <li><strong>Exámenes:</strong> Realiza las evaluaciones programadas</li>
                    <li><strong>Tutorías:</strong> Consulta las sesiones de tutoría y accede a las videollamadas</li>
                    <li><strong>Calendario:</strong> Visualiza todas las fechas importantes del curso</li>
                    <li><strong>Foro:</strong> Participa en discusiones con otros estudiantes y tutores</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

              {course.video_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vídeo de Presentación</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <video 
                        src={course.video_url} 
                        controls 
                        className="w-full h-full"
                      >
                        Tu navegador no soporta el elemento de vídeo.
                      </video>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Objetivos del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Objetivo General</h3>
                      <p className="text-muted-foreground">
                        {course.objectives || "Al finalizar este curso, habrás adquirido los conocimientos y competencias necesarios para desempeñarte con éxito en el área de estudio."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Objetivos Específicos</h3>
                      <ul className="space-y-2">
                        {course.specific_objectives && course.specific_objectives.length > 0 ? (
                          course.specific_objectives.map((obj: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{obj}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Comprender los conceptos fundamentales de la materia</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Aplicar los conocimientos adquiridos en casos prácticos</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Desarrollar habilidades de análisis crítico</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Trabajar de forma colaborativa en proyectos del área</span>
                            </li>
                          </>
                        )}
                      </ul>

                      {course.concept_map_url && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-4">Mapa Conceptual</h3>
                          <img 
                            src={course.concept_map_url} 
                            alt="Mapa conceptual del curso" 
                            className="w-full rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {course.tutor_cv_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Curriculum del Docente</CardTitle>
                    <CardDescription>CV del profesional que imparte este curso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <a 
                        href={course.tutor_cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FileDown className="h-4 w-4" />
                        Descargar CV del Docente
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <GradesSection courseId={courseId!} enrollmentId={enrollment?.id} />
          </TabsContent>

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

          <TabsContent value="exams" className="space-y-4">
            {exams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay exámenes disponibles</p>
                </CardContent>
              </Card>
            ) : (
              exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {exam.title}
                      </span>
                      <Badge variant={exam.evaluation_attempts?.some((a: any) => a.status === 'completed') ? "default" : "secondary"}>
                        {exam.evaluation_attempts?.some((a: any) => a.status === 'completed') ? "Completado" : "Pendiente"}
                      </Badge>
                    </CardTitle>
                    {exam.description && (
                      <CardDescription>{exam.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Nota mínima: <strong>{exam.passing_score}%</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Intentos: <strong>{exam.max_attempts || "Ilimitados"}</strong>
                      </span>
                      {exam.time_limit_minutes && (
                        <span className="text-muted-foreground">
                          Tiempo: <strong>{exam.time_limit_minutes} min</strong>
                        </span>
                      )}
                    </div>
                    {exam.evaluation_attempts && exam.evaluation_attempts.length > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Último intento:</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            Calificación: <strong>{exam.evaluation_attempts[0].score}%</strong>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(exam.evaluation_attempts[0].completed_at).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                      </div>
                    )}
                    <Button className="w-full mt-4">
                      {exam.evaluation_attempts?.some((a: any) => a.status === 'completed') ? "Ver Resultados" : "Comenzar Examen"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-4">
            {tutorials.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay tutorías programadas</p>
                </CardContent>
              </Card>
            ) : (
              tutorials.map((tutorial) => (
                <Card key={tutorial.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {tutorial.title}
                    </CardTitle>
                    <CardDescription>
                      {new Date(tutorial.start_time).toLocaleString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                      {tutorial.end_time && ` - ${new Date(tutorial.end_time).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tutorial.description && (
                      <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                    )}
                    {tutorial.meeting_url && (
                      <Button className="w-full" asChild>
                        <a href={tutorial.meeting_url} target="_blank" rel="noopener noreferrer">
                          Acceder a la Tutoría
                        </a>
                      </Button>
                    )}
                    {tutorial.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-medium">Ubicación:</span> {tutorial.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
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
                              <span>
                                {new Date(event.start_time).toLocaleString('es-ES', {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
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

          <TabsContent value="time-tracking" className="space-y-4">
            <TimeTrackingReport 
              courseName={course?.title || ""}
              modules={modules}
              enrollment={enrollment}
              studentName={studentName}
            />
          </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
